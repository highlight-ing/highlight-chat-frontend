type IntegrationWrapperProps = {
  children: React.ReactNode
}

export function IntegrationWrapper(props: IntegrationWrapperProps) {
  return <div className="mt-2">{props.children}</div>
}
