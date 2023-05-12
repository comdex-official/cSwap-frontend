import Image from "next/image";

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
  onClick,
}) => {
  return (
    <Image
      onClick={onClick}
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
