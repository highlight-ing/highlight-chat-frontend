import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { TrashIcon } from 'lucide-react'
import { useFormState } from 'react-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Button from '@/components/Button/Button'
import { AgentModeIcon } from '@/components/icons'
import InputField from '@/components/TextInput/InputField'

import { IntegrationSubmitButton } from '@/features/integrations/_components/submit-button'

import { enableAgentModeSchema } from './schema'

interface EnableAgentModeProps {
  agentInstructions: string
  agentGoals: string[]
  url: string
}

export function EnableAgentMode({ agentInstructions, agentGoals, url }: EnableAgentModeProps) {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof enableAgentModeSchema>>({
    resolver: zodResolver(enableAgentModeSchema),
    shouldFocusError: true,
    defaultValues: {
      agentInstructions,
      agentGoals,
      url,
    },
  })

  const handleSubmit = async () => {
    setIsPending(true)
    console.log('submitting form', form.getValues())
  }

  const handleDeleteGoal = (index: number) => {
    form.setValue(
      'agentGoals',
      form.getValues('agentGoals').filter((_, i) => i !== index),
    )
  }

  const handleUpdateGoal = (index: number, value: string) => {
    form.setValue(`agentGoals.${index}`, value)
  }

  const handleAddGoal = () => {
    form.setValue('agentGoals', [...form.getValues('agentGoals'), ''])
  }

  const goals = form.watch('agentGoals')

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isFormValid = () => {
    const values = form.getValues()
    const hasEmptyGoals = values.agentGoals.some((goal) => !goal.trim())
    return (
      values.url && isValidUrl(values.url) && values.agentInstructions && values.agentGoals.length > 0 && !hasEmptyGoals
    )
  }

  const getErrorMessage = (): string => {
    const values = form.getValues()
    const missing = []
    if (!values.url) missing.push('URL')
    if (values.url && !isValidUrl(values.url)) missing.push('Valid URL format')
    if (!values.agentInstructions) missing.push('Instructions')
    if (values.agentGoals.length === 0) missing.push('Goals')
    if (values.agentGoals.some((goal, idx) => !goal.trim() && missing.push(`Goal ${idx + 1} is empty`))) {
    }

    return missing.length === 1
      ? `Missing: ${missing[0]} field. Please fill in all required fields.`
      : `Missing: ${missing.join(', ')} fields. Please fill in all required fields.`
  }

  return (
    <div className="flex flex-col gap-2">
      <InputField
        label="Agent Instructions*"
        value={form.watch('agentInstructions')}
        onChange={(e) => form.setValue('agentInstructions', e.target.value)}
        size="xxlarge"
        labelAlwaysVisible
      />
      <InputField
        label="Starting URL*"
        value={form.watch('url')}
        onChange={(e) => form.setValue('url', e.target.value)}
        size="xxlarge"
        labelAlwaysVisible
      />
      <Accordion type="single" collapsible className="p-0 m-0">
        {goals.length > 0 ? (
          <div className="flex flex-col gap-2">
            <AccordionItem value="agent-goals" className="border-none !p-0 gap-2">
              <AccordionTrigger className="p-1">Agent Goals</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-2 mt-2">
                {goals.map((_, index) => (
                  <div key={index} className="flex flex-row gap-2 w-full items-center">
                    <InputField
                      key={index}
                      label={`Goal ${index + 1}*`}
                      value={form.watch(`agentGoals.${index}`)}
                      onChange={(e) => handleUpdateGoal(index, e.target.value)}
                      size="xxlarge"
                      className="flex-1"
                      labelAlwaysVisible
                    />
                    <Button variant="danger" size="icon" className="h-9 w-9" onClick={() => handleDeleteGoal(index)}>
                      <TrashIcon size={30} className="text-white" />
                    </Button>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <Button variant="primary-outline" size="small" className="self-end" onClick={handleAddGoal}>
              Add Goal
            </Button>
          </div>
        ) : (
          <Button variant="primary-outline" size="large" className="w-full" onClick={handleAddGoal}>
            Add Goal
          </Button>
        )}
      </Accordion>
      <IntegrationSubmitButton
        isPending={isPending}
        label="Enable Agent Mode"
        icon={<AgentModeIcon size={20} />}
        onClick={handleSubmit}
        disabled={!isFormValid()}
        tooltip={!isFormValid() ? getErrorMessage() : 'Unable to start Agent Mode'}
        defaultTooltip={'Start Agent Mode'}
        tooltipPosition="top"
        tooltipOffsetY={10}
        tooltipOffsetX={-300}
      />
    </div>
  )
}
