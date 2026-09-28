const Icon = ({ name, size = 18 }) => {
  const paths = {
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,

    close: <path d="M6 6l12 12M18 6L6 18" />,

    sun: (
      <>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4-1.4" />
      </>
    ),

    moon: <path d="M20 13.4A8.2 8.2 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4z" />,

    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,

    mail: (
      <>
        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),

    linkedin: (
      <>
        <rect x="2.5" y="2.5" width="19" height="19" rx="3" />
        <path d="M7 10v7M7 7.2v.1M11.5 17v-4a2.5 2.5 0 0 1 5 0v4" />
      </>
    ),

    github: (
      <path d="M9 19c-4 1.4-4-2.2-5.6-2.7M15 21v-3.3a2.9 2.9 0 0 0-.8-2.2c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.3s-1-.3-3.4 1.3a11.7 11.7 0 0 0-6.2 0C6.3 2.7 5.3 3 5.3 3a4.3 4.3 0 0 0-.1 3.3A4.7 4.7 0 0 0 3.9 9.5c0 4.7 2.8 5.7 5.5 6a2.9 2.9 0 0 0-.8 2.2V21" />
    ),

    code: (
      <path d="M8.5 16.5L4 12l4.5-4.5M15.5 7.5L20 12l-4.5 4.5M13.5 4l-3 16" />
    ),

    server: (
      <>
        <rect x="3" y="4" width="18" height="7" rx="2" />
        <rect x="3" y="13" width="18" height="7" rx="2" />
        <path d="M7 7.5v.1M7 16.5v.1" />
      </>
    ),

    spark: (
      <path d="M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6zM18.5 15.5l.8 2.2 2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    ),

    book: <path d="M4 4.5A2 2 0 0 1 6 3h13v15H6a2 2 0 0 0-2 2z M19 18v3H6" />,

    layers: (
      <path d="M12 2.8l9 4.6-9 4.6-9-4.6zM3 12.2l9 4.6 9-4.6M3 16.6l9 4.6 9-4.6" />
    ),

    target: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3.5" />
      </>
    ),

    trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,

    pin: (
      <>
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.6" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
};

export default Icon;
