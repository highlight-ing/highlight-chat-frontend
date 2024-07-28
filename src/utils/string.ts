export const getDurationUnit = (duration: number, unit: 'hours' | 'minutes', abbreviated = false) => {
  if (abbreviated) {
    return duration > 1 ? (unit === 'hours' ? 'hrs' : 'mins') : unit === 'hours' ? 'hr' : 'min'
  } else {
    return duration > 1 ? unit : unit === 'hours' ? 'hour' : 'minute'
  }
}
