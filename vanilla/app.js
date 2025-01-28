$(document).ready(function () {
    // State management
    const state = {
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
    };

    // Initialize Range Sliders
    function initRangeSlider(sliderId, stateKey) {
        const $container = $(`#${sliderId}`);
        const $minInput = $container.find('input').first();
        const $maxInput = $container.find('input').last();
        const $progress = $container.find('.range-progress');
        const $minValue = $(`#${sliderId}MinValue`);
        const $maxValue = $(`#${sliderId}MaxValue`);

        function updateSliderValues() {
            const minVal = parseFloat($minInput.val());
            const maxVal = parseFloat($maxInput.val());

            // Always show integers in the range-values spans
            $(`#${sliderId.slice(0, -5)}MinValue`).text(Math.round(minVal));
            $(`#${sliderId.slice(0, -5)}MaxValue`).text(Math.round(maxVal));
        }

        function updateProgress() {
            const min = parseFloat($minInput.val());
            const max = parseFloat($maxInput.val());
            const range = parseFloat($maxInput.attr('max')) - parseFloat($minInput.attr('min'));
            const percent1 = ((min - $minInput.attr('min')) / range) * 100;
            const percent2 = ((max - $minInput.attr('min')) / range) * 100;

            $progress.css({
                left: `${percent1}% `,
                width: `${percent2 - percent1}% `
            });

            // Update numerical display
            updateSliderValues();

            state[stateKey] = [min, max];
        }

        // Update values on any slider movement
        $minInput.on('input', function () {
            updateProgress();
            updateSliderValues();
        });

        $maxInput.on('input', function () {
            updateProgress();
            updateSliderValues();
        });

        // Initial setup
        updateProgress();
        updateSliderValues();
    }

    // Initialize Multi-select Dropdowns
    function initMultiSelect(selectId, options = []) {
        const $select = $(`#${selectId}`);
        const $button = $select.find('.select-button');
        const $content = $select.find('.dropdown-content');
        const $optionsContainer = $content.find('.options-container');
        const stateKey = selectId === 'divisionSelect' ? 'divisions' : 'wbsCategory';

        // Clear existing options
        $optionsContainer.empty();

        // Populate options
        options.forEach(option => {
            const $option = $(`
            <label class="checkbox-wrapper">
                <input type="checkbox" value="${option.value}" checked>
                <span>${option.label}</span>
            </label>
            `);
            $optionsContainer.append($option);
        });

        // Update state with all options selected by default
        state[stateKey] = options;
        updateSelectedCount();

        // Toggle dropdown
        $button.on('click', function () {
            $content.toggle();
            const isVisible = $content.is(':visible');
            $button.find('.arrow').text(isVisible ? '▲' : '▼');
            $select.closest('.filter-section').toggleClass('active', isVisible);
        });

        // Handle select/unselect all
        $select.find('.select-all').on('click', function () {
            $optionsContainer.find('input').prop('checked', true).trigger('change');
        });

        $select.find('.unselect-all').on('click', function () {
            $optionsContainer.find('input').prop('checked', false).trigger('change');
        });

        // Update state on change
        $optionsContainer.on('change', 'input', function () {
            const selectedOptions = [];
            $optionsContainer.find('input:checked').each(function () {
                const value = $(this).val();
                const label = $(this).next('span').text();
                selectedOptions.push({ value, label });
            });
            state[stateKey] = selectedOptions;
            updateSelectedCount();
        });

        function updateSelectedCount() {
            const total = $optionsContainer.find('input').length;
            const selected = $optionsContainer.find('input:checked').length;
            $button.find('.selected-count').text(`${selected} of ${total} selected`);
        }

        // Close dropdown when clicking outside
        $(document).on('click', function (e) {
            if (!$(e.target).closest($select).length) {
                $content.hide();
                $button.find('.arrow').text('▼');
                $select.closest('.filter-section').removeClass('active');
            }
        });
    }

    // Initialize Date Pickers
    // Initialize Completion Status
    $('#completedCheckbox').on('change', function () {
        state.completionStatus.completed = this.checked;
    });

    $('#incompletedCheckbox').on('change', function () {
        state.completionStatus.incompleted = this.checked;
    });


    // Update the loading display function
    function showLoading(message) {
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
                <div class="loading-submessage">This may take up to 30 seconds...</div>
            </div>
        `;
    }

    // Update the submit button handler
    $('#submitButton').on('click', async function () {
        // Show the results section when submit is clicked
        $('.results-section').show();

        console.log('Submit button clicked');

        try {
            showLoading('Generating AI insights...');

            const requestPayload = {
                selected_divisions: state.divisions.map(d => d.value),
                phase_range: state.phase,
                wbs_categories: state.wbsCategory.map(w => w.value),
                duration_range: state.duration
            };
            console.log('Sending request with payload:', requestPayload);

            const response = await fetch('http://localhost:8000/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.items && data.items.length > 0) {
                renderInsights(data.items[0].ai_insights);
            } else {
                const resultsContainer = document.getElementById('resultsContainer');
                resultsContainer.innerHTML = '<div class="error">No results found. Try adjusting your filters.</div>';
            }

        } catch (error) {
            console.error('Error submitting data:', error);
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = `<div class="error">Failed to generate insights: ${error.message}</div>`;
        }
    });

    // Initialize components
    initRangeSlider('phaseRange', 'phase');
    initRangeSlider('durationRange', 'duration');

    // Fetch and initialize data
    async function fetchData() {
        try {
            const data = await fetchAirtableData();
            if (data) {
                console.log('Fetched data:', data); // Debug log

                // Get actual min/max values
                const phaseMin = Math.min(...data.processed.phases);
                const phaseMax = Math.max(...data.processed.phases);
                const durationMin = Math.round(Math.min(...data.processed.durations));
                const durationMax = Math.round(Math.max(...data.processed.durations));

                console.log('Phase range:', phaseMin, phaseMax); // Debug log
                console.log('Duration range:', durationMin, durationMax); // Debug log

                // Set range slider values
                $('#phaseRange input').each(function () {
                    $(this).attr({
                        'min': phaseMin,
                        'max': phaseMax,
                        'step': 1,
                        'value': $(this).is('#phaseMin') ? phaseMin : phaseMax
                    });
                });

                $('#durationRange input').each(function () {
                    $(this).attr({
                        'min': durationMin,
                        'max': durationMax,
                        'step': 1,
                        'value': $(this).is('#durationMin') ? durationMin : durationMax
                    });
                });

                // Set initial span values
                $('#phaseMinValue').text(phaseMin);
                $('#phaseMaxValue').text(phaseMax);
                $('#durationMinValue').text(Math.round(durationMin));
                $('#durationMaxValue').text(Math.round(durationMax));

                // Initialize components with real data
                initMultiSelect('divisionSelect', data.processed.divisions);
                initMultiSelect('wbsSelect', data.processed.wbsCategories);

                // Initialize date pickers with real date ranges
                const dateConfig = {
                    minDate: data.ranges.dates.min,
                    maxDate: data.ranges.dates.max,
                    defaultDate: data.ranges.dates.min, // Set default date for start
                    disable: [
                        {
                            from: new Date(0), // Beginning of time
                            to: new Date(data.ranges.dates.min - 86400000) // Day before min date
                        },
                        {
                            from: new Date(data.ranges.dates.max.getTime() + 86400000), // Day after max date
                            to: new Date(8640000000000000) // End of time
                        }
                    ],
                    dateFormat: "Y-m-d",
                    onChange: ([date]) => {
                        state.startDate = date;
                    }
                };

                // Initialize start date picker
                flatpickr('#startDate', dateConfig);

                // Initialize end date picker with max date as default
                const endDateConfig = {
                    ...dateConfig,
                    defaultDate: data.ranges.dates.max,
                    onChange: ([date]) => {
                        state.endDate = date;
                    }
                };
                flatpickr('#endDate', endDateConfig);

                // Reinitialize range sliders with new values
                initRangeSlider('phaseRange', 'phase');
                initRangeSlider('durationRange', 'duration');

                // Debug log final state
                console.log('Phase slider values:', $('#phaseMin').val(), $('#phaseMax').val());
                console.log('Duration slider values:', $('#durationMin').val(), $('#durationMax').val());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Fetch real data
    fetchData();

    function renderInsights(insights) {
        console.log('Rendering insights:', insights);

        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer) {
            console.error('Results container not found!');
            return;
        }

        const insightsContainer = document.createElement('div');
        insightsContainer.className = 'insights-container';

        // Add a header with item key if available
        if (insights.item_key) {
            const header = document.createElement('h3');
            header.textContent = `Analysis for Item: ${insights.item_key}`;
            insightsContainer.appendChild(header);
        }

        const sections = [
            { title: "Construction Details", content: insights.construction_details },
            { title: "Required Submittals", content: insights.submittals },
            { title: "Specifications", content: insights.specifications },
            { title: "Potential RFIs", content: insights.rfis },
            { title: "Required Photos", content: insights.photos_required },
            { title: "Best Practices", content: insights.best_practices },
            { title: "Safety Considerations", content: insights.safety_considerations },
            { title: "Dependencies", content: insights.dependencies },
            { title: "Labor Requirements", content: insights.estimated_labor_hours },
            { title: "Material Specifications", content: insights.material_specifications },
            { title: "Quality Control", content: insights.quality_control },
            { title: "Coordination Notes", content: insights.coordination_notes }
        ];

        let hasContent = false;

        sections.forEach(({ title, content }) => {
            if (content) {
                hasContent = true;
                const section = document.createElement('div');
                section.className = 'insight-section';

                const heading = document.createElement('h4');
                heading.textContent = title;

                const contentDiv = document.createElement('div');
                // Use marked to parse markdown content
                contentDiv.innerHTML = marked.parse(content);

                section.appendChild(heading);
                section.appendChild(contentDiv);
                insightsContainer.appendChild(section);
            }
        });

        resultsContainer.innerHTML = '';
        if (hasContent) {
            resultsContainer.appendChild(insightsContainer);
        } else {
            resultsContainer.innerHTML = '<div class="error">No insights available for this item.</div>';
        }
    }

    // Add this to verify the script is loaded
    console.log('Analytics script loaded');
}); 