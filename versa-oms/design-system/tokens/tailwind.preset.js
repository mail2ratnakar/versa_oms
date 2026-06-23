/** Versa Tailwind preset skeleton */
module.exports = {
  theme: {
    extend: {
      colors: {
        versa: {
          bg: {
            app: "#F8FAFC",
            surface: "#FFFFFF",
            muted: "#F1F5F9"
          },
          text: {
            primary: "#111827",
            secondary: "#374151",
            muted: "#6B7280"
          },
          border: "#E5E7EB",
          focus: "#3D47ED",
          brand: {
            primary: "#0D19E9",
            soft: "#626AF6",
            pale: "#CFD1FB"
          },
          success: {
            fg: "#166534",
            bg: "#DCFCE7"
          },
          warning: {
            fg: "#92400E",
            bg: "#FEF3C7"
          },
          danger: {
            fg: "#991B1B",
            bg: "#FEE2E2"
          }
        }
      },
      borderRadius: {
        versa: "14px",
        "versa-lg": "18px",
        "versa-xl": "24px"
      },
      boxShadow: {
        versa: "0 8px 24px rgba(15, 23, 42, 0.08)"
      }
    }
  }
};
