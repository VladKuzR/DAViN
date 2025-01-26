const AIRTABLE_API_KEY = config.AIRTABLE_API_KEY;
const BASE_ID = 'appuojNVDfs9U7ccy';
const MAIN_TABLE_ID = 'tbl60mtZmcPavvtQH';
const DIVISIONS_TABLE_ID = 'tblhgavnKoFlFD8SC';

async function fetchAirtableData() {
    try {
        // Fetch both tables
        const [recordsMainRes, recordsDivisionsRes] = await Promise.all([
            fetch(`https://api.airtable.com/v0/${BASE_ID}/${MAIN_TABLE_ID}`, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`
                }
            }),
            fetch(`https://api.airtable.com/v0/${BASE_ID}/${DIVISIONS_TABLE_ID}`, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`
                }
            })
        ]);

        const recordsMain = await recordsMainRes.json();
        const recordsDivisions = await recordsDivisionsRes.json();

        // Create a mapping of Division UID to CSI name
        const divisionMapping = recordsDivisions.records.reduce((acc, record) => {
            acc[record.id] = record.fields['CSI Name'];
            return acc;
        }, {});

        const data = recordsMain.records.map(record => record.fields);

        // Helper function to parse date
        const parseDate = (dateStr) => {
            const date = new Date(dateStr);
            return date instanceof Date && !isNaN(date) ? date : null;
        };

        // Process the data
        const processedData = {
            phases: [...new Set(data.map(item => Number(item.Phase) || 0))],
            divisions: [...new Set(data.map(item => item.Division))]
                .filter(Boolean)
                .map(div => String(div).trim())
                .filter(div => div !== '')
                .map(div => ({
                    value: div,
                    label: divisionMapping[div] || `Division ${div}`,
                    sortOrder: Number(div.replace(/\D/g, '')) || 0
                }))
                .reduce((unique, item) => {
                    const exists = unique.some(u => u.label === item.label);
                    if (!exists) {
                        unique.push(item);
                    }
                    return unique;
                }, [])
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

        const minStartDate = processedData.startDates.length
            ? new Date(Math.min(...processedData.startDates))
            : null;

        const maxEndDate = processedData.endDates.length
            ? new Date(Math.max(...processedData.endDates))
            : null;

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
} 