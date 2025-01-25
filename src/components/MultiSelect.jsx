import React from 'react';
import styled from 'styled-components';
import Select from 'react-select';

const StyledSelect = styled(Select)`
  .select__control {
    background: rgba(0, 255, 242, 0.05);
    border: 1px solid rgba(0, 255, 242, 0.2);
    border-radius: 5px;
    color: #00fff2;
  }

  .select__menu {
    background: #0d2337;
    border: 1px solid rgba(0, 255, 242, 0.2);
  }

  .select__option {
    background: transparent;
    color: #00fff2;
    
    &:hover {
      background: rgba(0, 255, 242, 0.1);
    }
  }
`;

export const MultiSelect = ({ options, value, onChange }) => {
  return (
    <StyledSelect
      isMulti
      options={options}
      value={value}
      onChange={onChange}
      classNamePrefix="select"
    />
  );
}; 