import React from 'react';
import styled from 'styled-components';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DatePickerContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    background: ${props => props.theme.cardBg};
    border: 1px solid ${props => props.theme.cardBorder};
    border-radius: 5px;
    color: ${props => props.theme.text};
    padding: 0.5rem;
    width: 100%;
  }

  .react-datepicker {
    background: ${props => props.theme.cardBg};
    border: 1px solid ${props => props.theme.cardBorder};
    color: ${props => props.theme.text};
  }

  .react-datepicker__header {
    background: ${props => props.theme.cardBg};
    border-bottom: 1px solid ${props => props.theme.cardBorder};
  }

  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: ${props => props.theme.text};
  }

  .react-datepicker__day {
    color: ${props => props.theme.text};
    &:hover {
      background: ${props => props.theme.accent};
      color: ${props => props.theme.cardBg};
    }
  }
`;

export const DateRangePicker = ({ startDate, endDate, onChange, minDate, maxDate }) => {
  return (
    <DatePickerContainer>
      <ReactDatePicker
        selected={startDate}
        onChange={(date) => onChange({ start: date, end: endDate })}
        placeholderText="Start Date"
        minDate={minDate}
        maxDate={endDate || maxDate}
      />
      <ReactDatePicker
        selected={endDate}
        onChange={(date) => onChange({ start: startDate, end: date })}
        placeholderText="End Date"
        minDate={startDate || minDate}
        maxDate={maxDate}
      />
    </DatePickerContainer>
  );
}; 