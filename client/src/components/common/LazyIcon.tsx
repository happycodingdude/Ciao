import { ComponentType, lazy, Suspense } from "react";

// ✅ Lazy load icons on demand to reduce initial bundle
const iconCache = new Map<string, ComponentType<any>>();

const getIcon = (iconName: string) => {
  if (!iconCache.has(iconName)) {
    iconCache.set(
      iconName,
      lazy(() =>
        import("@ant-design/icons").then((module) => ({
          default: (module as any)[iconName],
        })),
      ),
    );
  }
  return iconCache.get(iconName)!;
};

interface LazyIconProps {
  name: string;
  [key: string]: any;
}

export const LazyIcon = ({ name, ...props }: LazyIconProps) => {
  const Icon = getIcon(name);

  return (
    <Suspense
      fallback={
        <span
          style={{ width: "1em", height: "1em", display: "inline-block" }}
        />
      }
    >
      <Icon {...props} />
    </Suspense>
  );
};

export default LazyIcon;
