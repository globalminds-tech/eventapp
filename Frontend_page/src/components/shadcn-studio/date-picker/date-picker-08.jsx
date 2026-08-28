import React from 'react'
import { Input } from '@/components/ui/Input'

const DatePickerDemo = ({ value, onChange, disabled, hasError, label }) => {
  return (
    <div className='flex w-full flex-col gap-1'>
      {label && (
        <label htmlFor='time-picker' className='px-1 text-xs font-semibold text-slate-700'>
          {label}
        </label>
      )}
      <Input
        type='text'
        id='time-picker'
        placeholder='08:30 AM'
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        error={hasError}
        className='bg-white text-xs font-semibold h-9 rounded-lg border-slate-200 focus-visible:ring-cyan-500'
      />
    </div>
  )
}

export default DatePickerDemo
