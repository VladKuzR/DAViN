import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { RangeSlider } from './RangeSlider';
import { MultiSelectCheckbox } from './MultiSelectCheckbox';
import { DateRangePicker } from './DatePicker';
import { fetchAirtableData } from '../services/airtable';
import { lightTheme, darkTheme } from '../themes/themes';
import styled from 'styled-components';
import { handleSubmit } from '../services/formHandler';

const DashboardContainer = styled.div`
    background: rgba(0, 0, 0, 0.7);  // Semi-transparent dark background
    height: 100vh;
    color: ${props => props.theme.text};
    padding: 0.75rem;
    font-family: 'Rajdhani', sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    backdrop-filter: blur(10px);  // Adds blur effect to background
`;

const FilterGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    margin: 0.5rem 0;
`;

const FilterSection = styled.div`
    background: rgba(0, 20, 30, 0.5);  // Semi-transparent dark blue
    border: 1px solid rgba(0, 255, 255, 0.1);  // Subtle cyan border
    border-radius: 8px;
    padding: 0.5rem;
    backdrop-filter: blur(5px);
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const DropdownFilterSection = styled(FilterSection)`
    z-index: ${({ $isOpen }) => $isOpen ? 100000 : 3};
`;

const SubmitButton = styled.button`
    background: rgba(0, 255, 255, 0.2);  // Semi-transparent cyan
    color: #00ffff;
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 8px;
    padding: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    backdrop-filter: blur(5px);

    &:hover {
        background: rgba(0, 255, 255, 0.3);
        transform: translateY(-1px);
    }
`;

const CheckboxContainer = styled.div`
    display: flex;
    justify-content: space-evenly;
    gap: 1rem;
    margin-top: 0.5rem;
`;

const Checkbox = ({ checked, onChange, label }) => (
    <CheckboxWrapper>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
        />
        <span>{label}</span>
    </CheckboxWrapper>
);

const CheckboxWrapper = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: ${props => props.theme.accent};
    }
`;

const FilterHeading = styled.h3`
    font-size: 0.9rem;
    margin: 0 0 0.3rem 0;
`;

const Title = styled.h1`
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
`;

const DashboardInterface = () => {
    const [data, setData] = useState(null);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [filters, setFilters] = useState({
        phase: [0, 100],
        divisions: [],
        wbsCategory: [],
        duration: [0, 100],
        completionStatus: {
            completed: true,
            incompleted: true
        },
        startDate: null,
        endDate: null
    });
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const airtableData = await fetchAirtableData();
            console.log('Division data received in component:', airtableData?.processed?.divisions);
            setData(airtableData);
            if (airtableData?.processed) {
                setFilters(prev => ({
                    ...prev,
                    phase: airtableData.ranges.phase,
                    duration: airtableData.ranges.duration,
                    divisions: airtableData.processed.divisions || [],
                    wbsCategory: airtableData.processed.wbsCategories || [],
                    startDate: airtableData.ranges.dates.min,
                    endDate: airtableData.ranges.dates.max
                }));
            }
        };
        loadData();
    }, []);

    const handleCompletionChange = (status) => {
        setFilters(prev => ({
            ...prev,
            completionStatus: {
                ...prev.completionStatus,
                [status]: !prev.completionStatus[status]
            }
        }));
    };

    const onSubmit = async () => {
        const result = await handleSubmit(filters);
        // Handle the result as needed
    };

    const handleDropdownToggle = (id, isOpen) => {
        setOpenDropdown(isOpen ? id : null);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <DashboardContainer>
                <Title>Project Analytics Interface</Title>
                <FilterGrid>
                    <FilterSection>
                        <FilterHeading>Phase Range</FilterHeading>
                        <RangeSlider
                            value={filters.phase}
                            onChange={(value) => setFilters({ ...filters, phase: value })}
                            min={data?.ranges?.phase[0]}
                            max={data?.ranges?.phase[1]}
                        />
                    </FilterSection>

                    <DropdownFilterSection $isOpen={openDropdown === 'division'}>
                        <FilterHeading>Division</FilterHeading>
                        <MultiSelectCheckbox
                            options={data?.processed?.divisions || []}
                            value={filters.divisions}
                            onChange={(value) => setFilters({ ...filters, divisions: value })}
                            identifier="division"
                            onDropdownToggle={(isOpen) => handleDropdownToggle('division', isOpen)}
                        />
                    </DropdownFilterSection>

                    <DropdownFilterSection $isOpen={openDropdown === 'wbs'}>
                        <FilterHeading>WBS Category</FilterHeading>
                        <MultiSelectCheckbox
                            options={data?.processed?.wbsCategories || []}
                            value={filters.wbsCategory}
                            onChange={(value) => setFilters({ ...filters, wbsCategory: value })}
                            identifier="wbs"
                            onDropdownToggle={(isOpen) => handleDropdownToggle('wbs', isOpen)}
                        />
                    </DropdownFilterSection>

                    <FilterSection>
                        <FilterHeading>Duration Range</FilterHeading>
                        <RangeSlider
                            value={filters.duration}
                            onChange={(value) => setFilters({ ...filters, duration: value })}
                            min={data?.ranges?.duration[0]}
                            max={data?.ranges?.duration[1]}
                        />
                    </FilterSection>

                    <FilterSection>
                        <FilterHeading>Completion Status</FilterHeading>
                        <CheckboxContainer>
                            <Checkbox
                                checked={filters.completionStatus.completed}
                                onChange={() => handleCompletionChange('completed')}
                                label="Completed"
                            />
                            <Checkbox
                                checked={filters.completionStatus.incompleted}
                                onChange={() => handleCompletionChange('incompleted')}
                                label="Incompleted"
                            />
                        </CheckboxContainer>
                    </FilterSection>

                    <FilterSection>
                        <FilterHeading>Date Range</FilterHeading>
                        <DateRangePicker
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            onChange={({ start, end }) => setFilters({
                                ...filters,
                                startDate: start,
                                endDate: end
                            })}
                            minDate={data?.ranges?.dates?.min}
                            maxDate={data?.ranges?.dates?.max}
                        />
                    </FilterSection>
                </FilterGrid>
                <SubmitButton onClick={onSubmit}>
                    SUBMIT
                </SubmitButton>
            </DashboardContainer>
        </ThemeProvider>
    );
};

export default DashboardInterface; 