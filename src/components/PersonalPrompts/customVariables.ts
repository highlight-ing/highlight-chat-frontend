import variables from '@/variables.module.scss'
type ColorScheme = {
  icon: {
    color: string
  }
  background: {
    color: string
    hoverColor: string
  }
  button: {
    textColor: string
    backgroundColor: string
    hoverBackgroundColor: string
    borderColor: string
    hoverBorderColor: string
  }
  ctaButton: {
    textColor: string
    backgroundColor: string
    hoverBackgroundColor: string
    borderColor: string
    hoverBorderColor: string
  }
  useButton: {
    textColor: string
    backgroundColor: string
    hoverBackgroundColor: string
    borderColor: string
    hoverBorderColor: string
  }
}

type CSSVariables = {
  private: ColorScheme
  public: ColorScheme
  pinned: ColorScheme
}

const CSS_VARIABLES: CSSVariables = {
  private: {
    icon: {
      color: variables.textPrimary,
    },
    background: {
      color: variables.backgroundSecondary,
      hoverColor: '#292929',
    },
    button: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.backgroundTertiary,
      borderColor: variables.tertiary50,
      hoverBorderColor: variables.tertiary50,
    },
    ctaButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.backgroundTertiary,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.tertiary50,
    },
    useButton: {
      textColor: variables.primary100,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.backgroundTertiary,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: '#00EAFF70',
    },
  },
  public: {
    icon: {
      color: variables.pink100,
    },
    background: {
      color: variables.backgroundSecondary,
      hoverColor: variables.pink20,
    },
    button: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.pink20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.pink40,
    },
    ctaButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.pink20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.pink40,
    },
    useButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.pink20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.pink40,
    },
  },
  pinned: {
    icon: {
      color: variables.primary100,
    },
    background: {
      color: variables.backgroundSecondary,
      hoverColor: variables.primary20,
    },
    button: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.primary20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.primary20,
    },
    ctaButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.primary20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.primary20,
    },
    useButton: {
      textColor: variables.textSecondary,
      backgroundColor: variables.backgroundTertiary,
      hoverBackgroundColor: variables.primary20,
      borderColor: variables.backgroundTertiary,
      hoverBorderColor: variables.primary20,
    },
  },
}

export default CSS_VARIABLES
export type { ColorScheme, CSSVariables }
