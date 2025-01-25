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
    background: ${props => props.theme.body};
    border: 1px solid ${props => props.theme.cardBorder};
    color: ${props => props.theme.text};
  }

  .react-datepicker__month-container {
    background: ${props => props.theme.body};
    border-radius: 5px;
  }

  .react-datepicker__header {
    background: ${props => props.theme.body};
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
      color: ${props => props.theme.body};
    }
  }

  .react-datepicker__day--selected {
    background: ${props => props.theme.accent};
    color: ${props => props.theme.body} !important;
  }

  .react-datepicker__day--keyboard-selected {
    background: ${props => props.theme.accent};
    color: ${props => props.theme.body} !important;
  }
`;

export const DateRangePicker = ({ startDate, endDate, onChange, minDate, maxDate }) => {
  // Convert string dates to Date objects if needed
  const parseDate = (date) => {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  };

  const handleStartDateChange = (date) => {
    onChange({
      start: date,
      end: endDate
    });
  };

  const handleEndDateChange = (date) => {
    onChange({
      start: startDate,
      end: date
    });
  };

  return (
    <DatePickerContainer>
      <ReactDatePicker
        selected={parseDate(startDate)}
        onChange={handleStartDateChange}
        selectsStart
        startDate={parseDate(startDate)}
        endDate={parseDate(endDate)}
        placeholderText="Start Date"
        minDate={parseDate(minDate)}
        maxDate={parseDate(endDate || maxDate)}
        dateFormat="MM/dd/yyyy"
      />
      <ReactDatePicker
        selected={parseDate(endDate)}
        onChange={handleEndDateChange}
        selectsEnd
        startDate={parseDate(startDate)}
        endDate={parseDate(endDate)}
        placeholderText="End Date"
        minDate={parseDate(startDate || minDate)}
        maxDate={parseDate(maxDate)}
        dateFormat="MM/dd/yyyy"
      />
    </DatePickerContainer>
  );
}; 