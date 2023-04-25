import Image from 'next/image';
import { CSSProperties, useState } from 'react';

interface ImageProps {
  src: any;
  width?: any;
  alt: string;
  height?: any;
  layout?: any;
  objectFit?: any;
  style?: CSSProperties;
  className?: string;
  quality?: string;
  placeholder?: any;
}

export const NextImage = ({
  src,
  alt,
  height,
  width,
  layout,
  objectFit,
  style,
  className,
  quality,
  placeholder,
}: ImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      layout={layout}
      objectFit={objectFit}
      style={style}
      className={className}
      placeholder={placeholder}
      {...(width && width > 35
        ? { blurDataURL: `${src}?w=${width}&q=${quality || 50}` }
        : {})}
    />
  );
};
