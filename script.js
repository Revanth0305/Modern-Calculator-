document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mainDisplay = document.getElementById('mainDisplay');
    const secondaryDisplay = document.getElementById('secondaryDisplay');
    const historyList = document.getElementById('historyList');
    const themeToggle = document.getElementById('themeToggle');
    const buttons = document.querySelectorAll('.btn');
    
    // Calculator state
    const calculator = {
        displayValue: '0',       // Current value shown on main display
        firstOperand: null,      // First operand for binary operations
        waitingForSecondOperand: false, // Flag to check if we're waiting for second operand
        operator: null,          // Current operation to perform
        memory: 0,               // Memory value for M+ and M- operations
        history: []              // Array to store calculation history
    };
    
    /**
     * Updates the calculator display with current value
     */
    function updateDisplay() {
        mainDisplay.textContent = calculator.displayValue;
        
        // Update secondary display when an operation is pending
        if (calculator.firstOperand !== null) {
            if (calculator.operator) {
                // Show the current operation in secondary display
                const operatorSymbol = getOperatorSymbol(calculator.operator);
                secondaryDisplay.textContent = `${calculator.firstOperand} ${operatorSymbol}`;
            } else {
                secondaryDisplay.textContent = '';
            }
        } else {
            secondaryDisplay.textContent = '';
        }
    }
    
    /**
     * Converts operator to display symbol
     * @param {string} operator - The operator to convert
     * @returns {string} The display symbol
     */
    function getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
            '%': '%'
        };
        return symbols[operator] || operator;
    }
    
    /**
     * Handles input of a number
     * @param {string} digit - The digit that was pressed
     */
    function inputDigit(digit) {
        const { displayValue, waitingForSecondOperand } = calculator;
        
        // If we're waiting for second operand, replace display value
        if (waitingForSecondOperand) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            // Otherwise append to current display value, avoiding leading zeros
            calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    }
    
    /**
     * Handles input of a decimal point
     */
    function inputDecimal() {
        // If we're waiting for second operand, start with '0.'
        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        
        // Add decimal point only if it doesn't already exist
        if (!calculator.displayValue.includes('.')) {
            calculator.displayValue += '.';
        }
    }
    
    /**
     * Handles operator input
     * @param {string} nextOperator - The operator that was pressed
     */
    function handleOperator(nextOperator) {
        // Parse the current display value to a number
        const inputValue = parseFloat(calculator.displayValue);
        
        // If there's a pending operation and we're waiting for second operand,
        // just update the operator
        if (calculator.operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }
        
        // If this is the first operand, store it
        if (calculator.firstOperand === null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (calculator.operator) {
            // If we already have a first operand and an operator, perform the calculation
            const result = performCalculation();
            
            // Store the result with fixed decimal places for display
            calculator.displayValue = `${result}`;
            calculator.firstOperand = result;
            
            // Add to history
            addToHistory(`${calculator.firstOperand} ${getOperatorSymbol(calculator.operator)} ${inputValue}`, result);
        }
        
        // Set waiting flag and store the operator
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
    }
    
    /**
     * Performs the calculation based on the current state
     * @returns {number} The result of the calculation
     */
    function performCalculation() {
        const firstOperand = calculator.firstOperand;
        const secondOperand = parseFloat(calculator.displayValue);
        
        if (isNaN(firstOperand) || isNaN(secondOperand)) return 0;
        
        let result;
        
        switch (calculator.operator) {
            case '+':
                result = firstOperand + secondOperand;
                break;
            case '-':
                result = firstOperand - secondOperand;
                break;
            case '*':
                result = firstOperand * secondOperand;
                break;
            case '/':
                // Check for division by zero
                if (secondOperand === 0) {
                    return 'Error';
                }
                result = firstOperand / secondOperand;
                break;
            case '%':
                result = firstOperand % secondOperand;
                break;
            default:
                return secondOperand;
        }
        
        // Handle floating point precision issues
        return Math.round(result * 1000000000) / 1000000000;
    }
    
    /**
     * Calculates the square of the current value
     */
    function calculateSquare() {
        const currentValue = parseFloat(calculator.displayValue);
        
        if (!isNaN(currentValue)) {
            const result = currentValue * currentValue;
            calculator.displayValue = `${result}`;
            
            // If we're in the middle of an operation, update the display but don't change operands
            if (!calculator.waitingForSecondOperand) {
                // Add to history
                addToHistory(`${currentValue}²`, result);
            }
        }
    }
    
    /**
     * Resets the calculator to initial state
     */
    function resetCalculator() {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
    }
    
    /**
     * Adds a calculation to the history
     * @param {string} expression - The calculation expression
     * @param {number} result - The result of the calculation
     */
    function addToHistory(expression, result) {
        // Create history item
        const historyItem = {
            expression: expression,
            result: result
        };
        
        // Add to history array (limit to 10 items)
        calculator.history.unshift(historyItem);
        if (calculator.history.length > 10) {
            calculator.history.pop();
        }
        
        // Update history display
        updateHistoryDisplay();
    }
    
    /**
     * Updates the history display with current history items
     */
    function updateHistoryDisplay() {
        // Clear current history display
        historyList.innerHTML = '';
        
        // If no history, show message
        if (calculator.history.length === 0) {
            historyList.innerHTML = '<div class="text-center text-muted">No calculations yet</div>';
            return;
        }
        
        // Add each history item to the display
        calculator.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-expression">${item.expression}</span>
                <span class="history-result">${item.result}</span>
            `;
            historyList.appendChild(historyItem);
        });
    }
    
    /**
     * Toggles between light and dark theme
     */
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        
        // Update theme toggle icon
        if (document.body.classList.contains('dark-theme')) {
            themeToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-moon" viewBox="0 0 16 16">
                    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                </svg>
            `;
        } else {
            themeToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-brightness-high" viewBox="0 0 16 16">
                    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                </svg>
            `;
        }
    }
    
    /**
     * Adds animation to button when clicked
     * @param {HTMLElement} button - The button element
     */
    function animateButton(button) {
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 200);
    }
    
    // Add event listeners to all buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Add animation
            animateButton(button);
            
            const action = button.dataset.action;
            
            // Handle different button actions
            if (!action) {
                console.log('Button action not defined');
                return;
            }
            
            switch (action) {
                case 'number':
                    inputDigit(button.dataset.number);
                    break;
                case 'decimal':
                    inputDecimal();
                    break;
                case 'operator':
                    handleOperator(button.dataset.operator);
                    break;
                case 'clear':
                    resetCalculator();
                    break;
                case 'square':
                    calculateSquare();
                    break;
                case 'calculate':
                    if (calculator.firstOperand !== null && calculator.operator) {
                        const result = performCalculation();
                        const secondOperand = parseFloat(calculator.displayValue);
                        
                        // Add to history
                        addToHistory(`${calculator.firstOperand} ${getOperatorSymbol(calculator.operator)} ${secondOperand}`, result);
                        
                        calculator.displayValue = `${result}`;
                        calculator.firstOperand = result;
                        calculator.waitingForSecondOperand = true;
                        calculator.operator = null;
                    }
                    break;
            }
            
            // Update the display
            updateDisplay();
        });
    });
    
    // Add event listener for theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add keyboard support
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        
        // Number keys
        if (/^[0-9]$/.test(key)) {
            event.preventDefault();
            inputDigit(key);
            animateButton(document.querySelector(`[data-number="${key}"]`));
        }
        
        // Operators
        if (['+', '-', '*', '/'].includes(key)) {
            event.preventDefault();
            handleOperator(key);
            animateButton(document.querySelector(`[data-operator="${key}"]`));
        }
        
        // Decimal point
        if (key === '.') {
            event.preventDefault();
            inputDecimal();
            animateButton(document.querySelector('[data-action="decimal"]'));
        }
        
        // Enter key for calculate
        if (key === 'Enter') {
            event.preventDefault();
            document.querySelector('[data-action="calculate"]').click();
        }
        
        // Escape key for clear
        if (key === 'Escape') {
            event.preventDefault();
            resetCalculator();
            animateButton(document.querySelector('[data-action="clear"]'));
        }
        
        // Update the display
        updateDisplay();
    });
    
    // Initialize display
    updateDisplay();
})