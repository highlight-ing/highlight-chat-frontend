import variables from '@/variables.module.scss'

const CSS_VARIABLES = {
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
  forked: {
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
