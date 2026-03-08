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
	count,
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
import { getLatestAdvices } from "../advice/get-latest-advice";
import { getCustomerNoteImageUrls } from "./get-customer-note-image-url";

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

	// 画像 URL・アドバイスを一括取得して N+1 を解消
	const allImagePaths = notesWithImages.flatMap((note) =>
		note.images.map((img) => img.path),
	);
	const noteIds = notesWithImages.map((note) => note.customerNoteId);

	const [imageUrlMap, adviceMap] = await Promise.all([
		getCustomerNoteImageUrls(allImagePaths),
		getLatestAdvices(noteIds),
	]);

	const notesWithSignedUrls: CustomerNoteWithImages[] = notesWithImages.map(
		(note) => ({
			...note,
			advice: adviceMap.get(note.customerNoteId) ?? null,
			images: note.images.map((image) => ({
				createdAt: new Date(image.createdAt),
				customerNoteId: image.customerNoteId,
				displayOrder: image.displayOrder,
				path: image.path,
				url: imageUrlMap.get(image.path) ?? null,
			})),
		}),
	);

	const totalCountResult = await db
		.select({
			count: count(),
		})
		.from(customerNotesTable)
		.leftJoin(staffsTable, eq(customerNotesTable.staffId, staffsTable.staffId))
		.where(and(...filters));

	const totalCount = totalCountResult[0]?.count ?? 0;
	const totalPages = Math.ceil(totalCount / NOTES_PER_PAGE);

	return {
		currentPage: page,
		notes: notesWithSignedUrls,
		totalPages,
	};
}
