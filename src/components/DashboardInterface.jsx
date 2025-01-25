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
    background: ${props => props.theme.body};
    min-height: 100vh;
    color: ${props => props.theme.text};
    padding: 2rem;
    font-family: 'Rajdhani', sans-serif;
`;

const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
`;

const FilterSection = styled.div`
    background: ${props => props.theme.cardBg};
    border: 1px solid ${props => props.theme.cardBorder};
    border-radius: 10px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 1;
`;

const DropdownFilterSection = styled(FilterSection)`
    z-index: ${({ $isOpen }) => $isOpen ? 100000 : 3};
`;

const ThemeToggle = styled.button`
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: ${props => props.theme.accent};
    color: ${props => props.theme.cardBg};
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    box-shadow: 0 0 15px ${props => props.theme.shadowColor};
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.1);
    }
`;

const SubmitButton = styled.button`
    background: ${props => props.theme.accent};
    color: ${props => props.theme.body};
    border: none;
    border-radius: 10px;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    cursor: pointer;
    margin-top: 2rem;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px ${props => props.theme.shadowColor};
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px ${props => props.theme.shadowColor};
    }

    &:active {
        transform: translateY(0);
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
        <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
            <DashboardContainer>
                <ThemeToggle onClick={() => setIsDarkTheme(!isDarkTheme)}>
                    {isDarkTheme ? '☀️' : '🌙'}
                </ThemeToggle>
                <h1>Project Analytics Interface</h1>
                <FilterGrid>
                    <FilterSection>
                        <h3>Phase Range</h3>
                        <RangeSlider
                            value={filters.phase}
                            onChange={(value) => setFilters({ ...filters, phase: value })}
                            min={data?.ranges?.phase[0]}
                            max={data?.ranges?.phase[1]}
                        />
                    </FilterSection>

                    <DropdownFilterSection $isOpen={openDropdown === 'division'}>
                        <h3>Division</h3>
                        <MultiSelectCheckbox
                            options={data?.processed?.divisions || []}
                            value={filters.divisions}
                            onChange={(value) => setFilters({ ...filters, divisions: value })}
                            identifier="division"
                            onDropdownToggle={(isOpen) => handleDropdownToggle('division', isOpen)}
                        />
                    </DropdownFilterSection>

                    <DropdownFilterSection $isOpen={openDropdown === 'wbs'}>
                        <h3>WBS Category</h3>
                        <MultiSelectCheckbox
                            options={data?.processed?.wbsCategories || []}
                            value={filters.wbsCategory}
                            onChange={(value) => setFilters({ ...filters, wbsCategory: value })}
                            identifier="wbs"
                            onDropdownToggle={(isOpen) => handleDropdownToggle('wbs', isOpen)}
                        />
                    </DropdownFilterSection>

                    <FilterSection>
                        <h3>Duration Range</h3>
                        <RangeSlider
                            value={filters.duration}
                            onChange={(value) => setFilters({ ...filters, duration: value })}
                            min={data?.ranges?.duration[0]}
                            max={data?.ranges?.duration[1]}
                        />
                    </FilterSection>

                    <FilterSection>
                        <h3>Completion Status</h3>
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
                        <h3>Date Range</h3>
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