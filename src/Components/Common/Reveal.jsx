import { useEffect, useRef } from "react";

const Reveal = ({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  ...rest
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.style.transitionDelay = `${delay}ms`;
            element.classList.add("is-in");
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;