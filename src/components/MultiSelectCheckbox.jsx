import React from 'react';
import styled from 'styled-components';

const DropdownContainer = styled.div`
    position: relative;
    width: 100%;
`;

const DropdownButton = styled.div`
    padding: 0.5rem 1rem;
    background: ${props => props.theme.cardBg};
    border: 1px solid ${props => props.theme.cardBorder};
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
        border-color: ${props => props.theme.accent};
    }
`;

const DropdownContent = styled.div`
    position: relative;
    width: 100%;
    margin-top: 0.5rem;
    background: ${props => props.theme.body};
    border: 1px solid ${props => props.theme.cardBorder};
    border-radius: 5px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 99999;
    box-shadow: 0 4px 12px ${props => props.theme.shadowColor};

    /* Scrollbar styling */
    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${props => props.theme.cardBg};
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme.accent};
        border-radius: 3px;
        opacity: 0.7;
    }

    &::-webkit-scrollbar-thumb:hover {
        opacity: 1;
    }
`;

const CheckboxItem = styled.label`
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    color: ${props => props.theme.text};
    background: ${props => props.theme.cardBg};

    &:hover {
        background: ${props => props.theme.sliderTrackBg};
    }

    input {
        margin-right: 0.5rem;
        accent-color: ${props => props.theme.accent};
    }
`;

const ButtonsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: 1px solid ${props => props.theme.cardBorder};
    background: ${props => props.theme.cardBg};
`;

const ActionButton = styled.button`
    background: ${props => props.theme.accent};
    color: ${props => props.theme.body};
    border: none;
    border-radius: 4px;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
    font-size: 0.8rem;
    transition: opacity 0.2s;
    font-weight: 600;

    &:hover {
        opacity: 0.8;
    }
`;

const SelectedCount = styled.span`
    font-size: 0.9rem;
    color: ${props => props.theme.text};
`;

export const MultiSelectCheckbox = ({ options, value, onChange, label, identifier, onDropdownToggle }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                onDropdownToggle?.(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onDropdownToggle]);

    const handleSelectAll = () => {
        onChange(options);
    };

    const handleUnselectAll = () => {
        onChange([]);
    };

    const toggleOption = (option) => {
        const isSelected = value.some(item => item.value === option.value);
        if (isSelected) {
            onChange(value.filter(item => item.value !== option.value));
        } else {
            onChange([...value, option]);
        }
    };

    const toggleDropdown = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        onDropdownToggle?.(newIsOpen);
    };

    return (
        <DropdownContainer ref={dropdownRef}>
            <DropdownButton onClick={toggleDropdown}>
                <SelectedCount>
                    {value.length} of {options.length} selected
                </SelectedCount>
                <span>{isOpen ? '▲' : '▼'}</span>
            </DropdownButton>
            {isOpen && (
                <DropdownContent>
                    <ButtonsContainer>
                        <ActionButton onClick={handleSelectAll}>Select All</ActionButton>
                        <ActionButton onClick={handleUnselectAll}>Unselect All</ActionButton>
                    </ButtonsContainer>
                    {options.map((option, index) => (
                        <CheckboxItem key={`${identifier}-${option.value}-${index}`}>
                            <input
                                type="checkbox"
                                checked={value.some(item => item.value === option.value)}
                                onChange={() => toggleOption(option)}
                            />
                            {option.label}
                        </CheckboxItem>
                    ))}
                </DropdownContent>
            )}
        </DropdownContainer>
    );
}; 