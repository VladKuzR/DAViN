import Airtable from 'airtable';

const base = new Airtable({
    apiKey: process.env.REACT_APP_AIRTABLE_API_KEY
}).base('appuojNVDfs9U7ccy');

export const fetchAirtableData = async () => {
    try {
        const records = await base('tbl60mtZmcPavvtQH').select().all();
        const data = records.map(record => record.fields);

        // Helper function to parse date
        const parseDate = (dateStr) => {
            const date = new Date(dateStr);
            return date instanceof Date && !isNaN(date) ? date : null;
        };

        // Process the data to get ranges and categories
        const processedData = {
            phases: [...new Set(data.map(item => Number(item.Phase) || 0))],
            // Simplified division processing
            divisions: [...new Set(data.map(item => item.Division))]
                .filter(Boolean)
                .map(div => String(div).trim())
                .filter(div => div !== '')
                .sort((a, b) => {
                    // Convert strings to numbers for proper numerical sorting
                    const numA = Number(a.replace(/\D/g, ''));
                    const numB = Number(b.replace(/\D/g, ''));
                    return numA - numB;
                })
                .map(div => ({
                    value: div,
                    label: `Division ${div}`
                })),
            wbsCategories: [...new Set(data.map(item => item['WBS Category Level 1']))]
                .filter(Boolean)
                .sort()
                .map(cat => ({
                    value: cat,
                    label: cat
                })),
            durations: data.map(item => Number(item.Duration) || 0),
            startDates: data.map(item => parseDate(item['Start Date'])).filter(Boolean),
            endDates: data.map(item => parseDate(item['End Date'])).filter(Boolean)
        };

        // Get min and max dates
        const minStartDate = processedData.startDates.length
            ? new Date(Math.min(...processedData.startDates))
            : null;

        const maxEndDate = processedData.endDates.length
            ? new Date(Math.max(...processedData.endDates))
            : null;

        // Log for debugging
        console.log('Processed Divisions:', processedData.divisions);
        console.log('Date Range:', { min: minStartDate, max: maxEndDate });

        return {
            raw: data,
            processed: processedData,
            ranges: {
                phase: [Math.min(...processedData.phases), Math.max(...processedData.phases)],
                duration: [Math.min(...processedData.durations), Math.max(...processedData.durations)],
                dates: {
                    min: minStartDate,
                    max: maxEndDate
                }
            }
        };
    } catch (error) {
        console.error('Error fetching Airtable data:', error);
        return null;
    }
}; 