"use client";

import type React from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@workspace/ui/components/carousel";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import NoImage from "@/assets/no-image.png";
import type { CustomerNoteImageWithUrl } from "./get-customer-notes";

interface CustomerNoteImageGalleryProps {
  images: CustomerNoteImageWithUrl[];
}

export function CustomerNoteImageGallery({
  images,
}: CustomerNoteImageGalleryProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const handleImageClick = (index: number): void => {
    setInitialIndex(index);
    setOpen(true);
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    // Carousel API の現在位置を初期化する必要があるため effect 内で setState する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (api && open) {
      api.scrollTo(initialIndex);
    }
  }, [api, open, initialIndex]);

  // URLがない画像や空の画像配列は表示しない
  const validImages = images.filter((image) => image.url);

  if (validImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {validImages.map((image, index) => (
          <button
            className="relative size-[120px] overflow-hidden rounded-lg border transition-opacity hover:opacity-80"
            key={`${image.customerNoteId}-${image.displayOrder}`}
            onClick={() => handleImageClick(index)}
            type="button"
          >
            <Image
              alt={`添付画像サムネイル-${index + 1}`}
              className="object-cover"
              fill
              sizes="120px"
              src={image.url || NoImage.src}
            />
          </button>
        ))}
      </div>

      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerContent className="h-[90vh]">
          <DrawerTitle className="sr-only">ノート画像</DrawerTitle>

          <DrawerClose className="absolute top-4 right-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="size-6" />
            <span className="sr-only">閉じる</span>
          </DrawerClose>

          <div className="flex h-full flex-col items-center justify-center p-4">
            <Carousel
              className="w-full max-w-4xl flex-1"
              opts={{ loop: true }}
              setApi={setApi}
            >
              <CarouselContent className="h-full" wrapperClassName="h-full">
                {validImages.map((image) => (
                  <CarouselItem
                    className="h-full"
                    key={`${image.customerNoteId}-${image.displayOrder}`}
                  >
                    <div className="relative size-full overflow-hidden rounded-lg bg-muted">
                      <Image
                        alt={`添付-${image.displayOrder + 1}`}
                        className="object-contain"
                        fill
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        src={image.url ?? NoImage.src}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>

            <div className="mt-4 text-center">
              <p className="text-sm font-medium">
                {current + 1} / {validImages.length}
              </p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
