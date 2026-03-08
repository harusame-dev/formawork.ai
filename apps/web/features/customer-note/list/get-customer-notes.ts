"use cache";

import { db } from "@workspace/db/client";
import {
	customerNoteImagesTable,
	customerNotesTable,
	type SelectCustomerNote,
} from "@workspace/db/schema/customer-note";
import type { SelectCustomerNoteAdvice } from "@workspace/db/schema/customer-note-advice";
import { staffsTable } from "@workspace/db/schema/staff";
import {
	and,
	desc,
	eq,
	gte,
	ilike,
	lt,
	or,
	type SQL,
	sql,
} from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { CustomerTag } from "@/features/customer/tag";
import { getLatestAdvice } from "../advice/get-latest-advice";
import { getCustomerNoteImageUrl } from "./get-customer-note-image-url";

export type CustomerNoteSearchCondition = {
	customerId: string;
	dateFrom?: string;
	dateTo?: string;
	keyword?: string;
	page?: number;
};

export type CustomerNoteImageWithUrl = {
	customerNoteId: string;
	path: string;
	displayOrder: number;
	createdAt: Date;
	url: string | null;
};

export type CustomerNoteWithImages = SelectCustomerNote & {
	advice: SelectCustomerNoteAdvice | null;
	images: CustomerNoteImageWithUrl[];
	staffName: string | null;
};

type RawCustomerNoteImage = {
	customerNoteId: string;
	path: string;
	displayOrder: number;
	createdAt: string;
};

const NOTES_PER_PAGE = 20;

export async function getCustomerNotes(
	condition: CustomerNoteSearchCondition,
): Promise<{
	notes: CustomerNoteWithImages[];
	currentPage: number;
	totalPages: number;
}> {
	cacheLife("permanent");
	cacheTag(CustomerTag.NotesByCustomerId(condition.customerId));

	const page = condition.page ?? 1;
	const offset = (page - 1) * NOTES_PER_PAGE;

	const filters: (SQL<unknown> | undefined)[] = [
		eq(customerNotesTable.customerId, condition.customerId),
	];

	if (condition.dateFrom) {
		filters.push(gte(customerNotesTable.serviceDate, condition.dateFrom));
	}

	if (condition.dateTo) {
		filters.push(lt(customerNotesTable.serviceDate, condition.dateTo));
	}

	if (condition.keyword) {
		filters.push(
			or(
				ilike(customerNotesTable.content, `%${condition.keyword}%`),
				ilike(staffsTable.firstName, `%${condition.keyword}%`),
				ilike(staffsTable.lastName, `%${condition.keyword}%`),
			),
		);
	}

	const notesWithImages = await db
		.select({
			content: customerNotesTable.content,
			createdAt: customerNotesTable.createdAt,
			customerId: customerNotesTable.customerId,
			customerNoteId: customerNotesTable.customerNoteId,
			images: sql<RawCustomerNoteImage[]>`COALESCE(json_agg(
				json_build_object(
					'customerNoteId', ${customerNoteImagesTable.customerNoteId},
					'path', ${customerNoteImagesTable.path},
					'displayOrder', ${customerNoteImagesTable.displayOrder},
					'createdAt', ${customerNoteImagesTable.createdAt}
				) ORDER BY ${customerNoteImagesTable.displayOrder}
			) FILTER (WHERE ${customerNoteImagesTable.customerNoteId} IS NOT NULL), '[]')`,
			serviceDate: customerNotesTable.serviceDate,
			staffId: customerNotesTable.staffId,
			staffName: sql<string>`CONCAT(${staffsTable.lastName}, ' ', ${staffsTable.firstName})`,
			totalCount: sql<number>`COUNT(*) OVER()`,
			updatedAt: customerNotesTable.updatedAt,
		})
		.from(customerNotesTable)
		.leftJoin(staffsTable, eq(customerNotesTable.staffId, staffsTable.staffId))
		.leftJoin(
			customerNoteImagesTable,
			eq(
				customerNotesTable.customerNoteId,
				customerNoteImagesTable.customerNoteId,
			),
		)
		.where(and(...filters))
		.groupBy(
			customerNotesTable.customerNoteId,
			customerNotesTable.content,
			customerNotesTable.customerId,
			customerNotesTable.serviceDate,
			customerNotesTable.staffId,
			customerNotesTable.createdAt,
			customerNotesTable.updatedAt,
			staffsTable.lastName,
			staffsTable.firstName,
		)
		.orderBy(desc(customerNotesTable.serviceDate))
		.limit(NOTES_PER_PAGE)
		.offset(offset);

	// 画像に signed URL を付与し、アドバイスを取得
	const notesWithSignedUrls: CustomerNoteWithImages[] = await Promise.all(
		notesWithImages.map(async (note) => {
			const [imagesWithUrls, advice] = await Promise.all([
				Promise.all(
					note.images.map(async (image) => ({
						createdAt: new Date(image.createdAt),
						customerNoteId: image.customerNoteId,
						displayOrder: image.displayOrder,
						path: image.path,
						url: await getCustomerNoteImageUrl(image.path),
					})),
				),
				getLatestAdvice(note.customerNoteId),
			]);

			return {
				...note,
				advice,
				images: imagesWithUrls,
			};
		}),
	);

	const totalCount = notesWithImages[0]?.totalCount ?? 0;
	const totalPages = Math.ceil(totalCount / NOTES_PER_PAGE);

	return {
		currentPage: page,
		notes: notesWithSignedUrls,
		totalPages,
	};
}
