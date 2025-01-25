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
  const parseDate = (date) => {
    if (!date) return null;
    const parsedDate = date instanceof Date ? date : new Date(date);
    // Ensure we're working with the date portion only, removing time components
    if (!isNaN(parsedDate.getTime())) {
      parsedDate.setHours(0, 0, 0, 0);
    }
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const handleStartDateChange = (date) => {
    onChange({
      start: date,
      end: parseDate(endDate)
    });
  };

  const handleEndDateChange = (date) => {
    onChange({
      start: parseDate(startDate),
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
        minDate={parseDate(minDate)}
        maxDate={parseDate(maxDate)}
        placeholderText="Start Date"
        dateFormat="MM/dd/yyyy"
        isClearable
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
      <ReactDatePicker
        selected={parseDate(endDate)}
        onChange={handleEndDateChange}
        selectsEnd
        startDate={parseDate(startDate)}
        endDate={parseDate(endDate)}
        minDate={parseDate(startDate)} // Only use startDate as min
        maxDate={parseDate(maxDate)}
        placeholderText="End Date"
        dateFormat="MM/dd/yyyy"
        isClearable
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
    </DatePickerContainer>
  );
}; 