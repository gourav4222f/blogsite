// Centralized media query breakpoints for react-responsive
// These objects are compatible with useMediaQuery from 'react-responsive'
// Example usage:
//   const isMobile = useMediaQuery(mobile)
//   const isTablet = useMediaQuery(tablet)

// Mobile: up to 767px
export const mobile = { maxWidth: 767 } as const

// Tablet: 768px to 1023px
export const tablet = { minWidth: 768, maxWidth: 1023 } as const

// Optional: Desktop 1024px and above (not currently used)
export const desktop = { minWidth: 1024 } as const
