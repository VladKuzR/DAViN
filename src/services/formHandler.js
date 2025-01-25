export const collectFormData = (filters) => {
    return {
        phase: {
            min: filters.phase[0],
            max: filters.phase[1]
        },
        divisions: filters.divisions,
        wbsCategory: filters.wbsCategory,
        duration: {
            min: filters.duration[0],
            max: filters.duration[1]
        },
        completionStatus: filters.completionStatus,
        dateRange: {
            startDate: filters.startDate,
            endDate: filters.endDate
        }
    };
};

export const handleSubmit = async (filters) => {
    const formData = collectFormData(filters);
    console.log('Submitted filters:', formData);
    // Here you can add API call or any other handling
    return formData;
}; 