import Airtable from 'airtable';

const base = new Airtable({
    apiKey: process.env.REACT_APP_AIRTABLE_API_KEY
}).base('appuojNVDfs9U7ccy');

export const fetchAirtableData = async () => {
    try {
        // Fetch both tables
        const recordsMain = await base('tbl60mtZmcPavvtQH').select().all();
        const recordsDivisions = await base('tblhgavnKoFlFD8SC').select().all();

        // Create a mapping of Division UID to CSI name
        const divisionMapping = recordsDivisions.reduce((acc, record) => {
            const fields = record.fields;
            acc[record.id] = fields['CSI Name'];
            return acc;
        }, {});

        console.log('Division Mapping:', divisionMapping); // Debug log

        const data = recordsMain.map(record => record.fields);

        // Helper function to parse date
        const parseDate = (dateStr) => {
            const date = new Date(dateStr);
            return date instanceof Date && !isNaN(date) ? date : null;
        };

        // Process the data to get ranges and categories
        const processedData = {
            phases: [...new Set(data.map(item => Number(item.Phase) || 0))],
            // Map divisions to their CSI names and ensure uniqueness
            divisions: [...new Set(data.map(item => item.Division))]
                .filter(Boolean)
                .map(div => String(div).trim())
                .filter(div => div !== '')
                .map(div => ({
                    value: div,
                    label: divisionMapping[div] || `Division ${div}`,
                    sortOrder: Number(div.replace(/\D/g, '')) || 0
                }))
                // Remove duplicates based on CSI names
                .reduce((unique, item) => {
                    const exists = unique.some(u => u.label === item.label);
                    if (!exists) {
                        unique.push(item);
                    }
                    return unique;
                }, [])
                // Sort by division number
                .sort((a, b) => a.sortOrder - b.sortOrder),
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

        // Debug logs
        console.log('Raw Division Data:', data.map(item => item.Division));
        console.log('Division UIDs:', Object.keys(divisionMapping));
        console.log('CSI Names:', Object.values(divisionMapping));
        console.log('Final Processed Divisions:', processedData.divisions);

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