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

        function setInitialValues() {
            const min = parseFloat($minInput.attr('min'));
            const max = parseFloat($maxInput.attr('max'));
            $minInput.val(min);
            $maxInput.val(max);
            state[stateKey] = [min, max];
            updateDisplay();
        }

        function setMinMax() {
            const minVal = parseFloat($minInput.val());
            const maxVal = parseFloat($maxInput.val());

            if (minVal > maxVal) {
                if ($(document.activeElement).is($minInput)) {
                    $maxInput.val(minVal);
                } else {
                    $minInput.val(maxVal);
                }
            }
        }

        function updateDisplay() {
            setMinMax();
            const min = parseFloat($minInput.val());
            const max = parseFloat($maxInput.val());
            const range = parseFloat($maxInput.attr('max')) - parseFloat($minInput.attr('min'));
            const percent1 = ((min - $minInput.attr('min')) / range) * 100;
            const percent2 = ((max - $minInput.attr('min')) / range) * 100;

            $progress.css({
                left: `${percent1}%`,
                width: `${percent2 - percent1}%`
            });

            // Update the display values with current slider values
            if (sliderId === 'durationRange') {
                $minValue.text(parseFloat(min).toFixed(1));
                $maxValue.text(parseFloat(max).toFixed(1));
            } else {
                $minValue.text(parseInt(min));
                $maxValue.text(parseInt(max));
            }
            state[stateKey] = [min, max];
        }

        // Update on both input and change events for better responsiveness
        $minInput.on('input', updateDisplay);
        $maxInput.on('input', updateDisplay);

        setInitialValues();
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
    flatpickr('#startDate', {
        onChange: ([date]) => {
            state.startDate = date;
        }
    });

    flatpickr('#endDate', {
        onChange: ([date]) => {
            state.endDate = date;
        }
    });

    // Initialize Completion Status
    $('#completedCheckbox').on('change', function () {
        state.completionStatus.completed = this.checked;
    });

    $('#incompletedCheckbox').on('change', function () {
        state.completionStatus.incompleted = this.checked;
    });

    // Initialize Submit Button
    $('#submitButton').on('click', async function () {
        try {
            const response = await fetch('http://localhost:8000/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selected_divisions: state.divisions.map(d => d.value),
                    phase_range: state.phase,
                    wbs_categories: state.wbsCategory.map(w => w.value),
                    duration_range: state.duration
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            
            // Here you can process the response data and update your UI
            // For example:
            // renderResults(data.items);
            // showInsights(data.ai_insights);
            // displayDocuments(data.document_references);

        } catch (error) {
            console.error('Error submitting data:', error);
            // Show error message to user
            alert('Failed to submit data. Please try again.');
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
                const durationMin = Math.min(...data.processed.durations);
                const durationMax = Math.max(...data.processed.durations);

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
                        'step': (durationMax - durationMin),
                        'value': $(this).is('#durationMin') ? durationMin : durationMax
                    });
                });

                // Initialize components with real data
                initMultiSelect('divisionSelect', data.processed.divisions);
                initMultiSelect('wbsSelect', data.processed.wbsCategories);

                // Initialize date pickers with real date ranges
                const dateConfig = {
                    minDate: data.ranges.dates.min,
                    maxDate: data.ranges.dates.max
                };
                flatpickr('#startDate', dateConfig);
                flatpickr('#endDate', dateConfig);

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
}); 