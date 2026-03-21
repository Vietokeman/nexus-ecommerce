import { useMemo, useState, type ImgHTMLAttributes } from 'react';

type ImageFallbackProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK = 'https://via.placeholder.com/300?text=Image';

export default function ImageFallback({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  onError,
  style,
  ...rest
}: ImageFallbackProps) {
  const [failed, setFailed] = useState(false);

  const resolvedSrc = useMemo(() => {
    if (!failed && src && src.trim().length > 0) {
      return src;
    }
    return fallbackSrc;
  }, [failed, fallbackSrc, src]);

  return (
    <img
      {...rest}
      src={resolvedSrc}
      onError={(event) => {
        if (!failed) {
          setFailed(true);
        }
        onError?.(event);
      }}
      style={{
        display: 'block',
        ...style,
      }}
    />
  );
}
