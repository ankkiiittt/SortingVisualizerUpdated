interface VisualizerElements {
    algorithmSelect: HTMLSelectElement;
    arraySize: HTMLInputElement;
    speedControl: HTMLInputElement;
    inputType: HTMLSelectElement;
    generateBtn: HTMLButtonElement;
    startBtn: HTMLButtonElement;
    pauseBtn: HTMLButtonElement;
    resetBtn: HTMLButtonElement;
    stopBtn: HTMLButtonElement;
    arrayBars: HTMLElement;
    sizeValue: HTMLElement;
    speedValue: HTMLElement;
    currentAlgorithm: HTMLElement;
    timeComplexity: HTMLElement;
    comparisons: HTMLElement;
    swaps: HTMLElement;
    timeElapsed: HTMLElement;
    progressBar: HTMLElement;
    algorithmDesc: HTMLElement;
}

interface AlgorithmInfo {
    name: string;
    complexity: string;
    description: string;
}

class SortingVisualizer {
    private array: number[];
    private originalArray: number[];
    private isSorting: boolean;
    private isPaused: boolean;
    private currentAlgorithm: string;
    private arraySize: number;
    private speed: number;
    private comparisons: number;
    private swaps: number;
    private startTime: number;
    private animationId: number | null;
    private algorithms: Record<string, AlgorithmInfo>;
    private elements!: VisualizerElements;

    constructor() {
        this.array = [];
        this.originalArray = [];
        this.isSorting = false;
        this.isPaused = false;
        this.currentAlgorithm = 'bubble';
        this.arraySize = 50;
        this.speed = 50;
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.animationId = null;

        this.algorithms = {
            bubble: { name: 'Bubble Sort', complexity: 'O(n²)', description: 'Compares adjacent elements and swaps them if in wrong order' },
            selection: { name: 'Selection Sort', complexity: 'O(n²)', description: 'Finds minimum element and places it at the beginning' },
            insertion: { name: 'Insertion Sort', complexity: 'O(n²)', description: 'Builds sorted array by inserting elements one by one' },
            merge: { name: 'Merge Sort', complexity: 'O(n log n)', description: 'Divides array and merges sorted subarrays' },
            quick: { name: 'Quick Sort', complexity: 'O(n log n)', description: 'Partitions around pivot and sorts recursively' },
            heap: { name: 'Heap Sort', complexity: 'O(n log n)', description: 'Uses heap data structure to sort elements' },
            radix: { name: 'Radix Sort', complexity: 'O(d×n)', description: 'Sorts by processing individual digits' },
            counting: { name: 'Counting Sort', complexity: 'O(n+k)', description: 'Counts occurrences of each element' },
            shell: { name: 'Shell Sort', complexity: 'O(n log n)', description: 'Optimized insertion sort with gap sequences' },
            cocktail: { name: 'Cocktail Sort', complexity: 'O(n²)', description: 'Bidirectional bubble sort variant' },
            bucket: { name: 'Bucket Sort', complexity: 'O(n²)', description: 'Distributes elements into buckets then sorts' }
        };

        this.initializeElements();
        this.setupEventListeners();
        this.generateArray();
        this.updateAlgorithmInfo();
    }

    private initializeElements(): void {
        this.elements = {
            algorithmSelect: document.getElementById('algorithm-select') as HTMLSelectElement,
            arraySize: document.getElementById('array-size') as HTMLInputElement,
            speedControl: document.getElementById('speed-control') as HTMLInputElement,
            inputType: document.getElementById('input-type') as HTMLSelectElement,
            generateBtn: document.getElementById('generate-btn') as HTMLButtonElement,
            startBtn: document.getElementById('start-btn') as HTMLButtonElement,
            pauseBtn: document.getElementById('pause-btn') as HTMLButtonElement,
            resetBtn: document.getElementById('reset-btn') as HTMLButtonElement,
            stopBtn: document.getElementById('stop-btn') as HTMLButtonElement,
            arrayBars: document.getElementById('array-bars') as HTMLElement,
            sizeValue: document.getElementById('size-value') as HTMLElement,
            speedValue: document.getElementById('speed-value') as HTMLElement,
            currentAlgorithm: document.getElementById('current-algorithm') as HTMLElement,
            timeComplexity: document.getElementById('time-complexity') as HTMLElement,
            comparisons: document.getElementById('comparisons') as HTMLElement,
            swaps: document.getElementById('swaps') as HTMLElement,
            timeElapsed: document.getElementById('time-elapsed') as HTMLElement,
            progressBar: document.getElementById('progress-bar') as HTMLElement,
            algorithmDesc: document.getElementById('algorithm-desc') as HTMLElement
        };
    }

    private setupEventListeners(): void {
        this.elements.algorithmSelect.addEventListener('change', (e: Event) => {
            if (!this.isSorting) {
                this.currentAlgorithm = (e.target as HTMLSelectElement).value;
                this.updateAlgorithmInfo();
            }
        });

        this.elements.arraySize.addEventListener('input', (e: Event) => {
            if (!this.isSorting) {
                this.arraySize = parseInt((e.target as HTMLInputElement).value);
                this.elements.sizeValue.textContent = this.arraySize.toString();
                this.generateArray();
            }
        });

        this.elements.speedControl.addEventListener('input', (e: Event) => {
            this.speed = parseInt((e.target as HTMLInputElement).value);
            this.elements.speedValue.textContent = `${this.speed}ms`;
        });

        this.elements.inputType.addEventListener('change', () => {
            if (!this.isSorting) {
                this.generateArray();
            }
        });

        this.elements.generateBtn.addEventListener('click', () => {
            if (!this.isSorting) {
                this.generateArray();
            }
        });

        this.elements.startBtn.addEventListener('click', () => this.startSorting());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.resetArray());
        this.elements.stopBtn.addEventListener('click', () => this.stopSorting());
    }

    private generateArray(): void {
        const type = this.elements.inputType.value;
        this.array = [];

        switch (type) {
            case 'random':
                for (let i = 0; i < this.arraySize; i++) {
                    this.array.push(Math.floor(Math.random() * 300) + 10);
                }
                break;
            case 'nearly-sorted':
                for (let i = 0; i < this.arraySize; i++) {
                    this.array.push(i * 5 + 10);
                }
                // Shuffle a few elements
                for (let i = 0; i < this.arraySize * 0.1; i++) {
                    const idx1 = Math.floor(Math.random() * this.arraySize);
                    const idx2 = Math.floor(Math.random() * this.arraySize);
                    [this.array[idx1], this.array[idx2]] = [this.array[idx2], this.array[idx1]];
                }
                break;
            case 'reversed':
                for (let i = 0; i < this.arraySize; i++) {
                    this.array.push((this.arraySize - i) * 5 + 10);
                }
                break;
            case 'few-unique':
                const values = [50, 100, 150, 200, 250];
                for (let i = 0; i < this.arraySize; i++) {
                    this.array.push(values[Math.floor(Math.random() * values.length)]);
                }
                break;
        }

        this.originalArray = [...this.array];
        this.renderArray();
        this.resetStats();
    }

    private renderArray(): void {
        this.elements.arrayBars.innerHTML = '';
        const maxValue = Math.max(...this.array);
        const containerWidth = this.elements.arrayBars.clientWidth || 800;
        const barWidth = Math.max(4, (containerWidth - this.arraySize * 2) / this.arraySize);

        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'bar generating';
            bar.style.height = `${(value / maxValue) * 300}px`;
            bar.style.width = `${barWidth}px`;
            bar.setAttribute('data-index', index.toString());
            bar.setAttribute('data-value', value.toString());
            this.elements.arrayBars.appendChild(bar);

            // Remove generating class after animation
            setTimeout(() => {
                bar.classList.remove('generating');
            }, 100);
        });
    }

    private async highlightBars(indices: number[], className: string, duration: number | null = null): Promise<void> {
        if (this.isPaused) await this.waitForUnpause();
        if (!this.isSorting) return;

        const bars = this.elements.arrayBars.children;

        // Clear previous highlights
        Array.from(bars).forEach(bar => {
            bar.classList.remove('comparing', 'swapping', 'pivot');
        });

        // Apply new highlights
        indices.forEach(index => {
            if (bars[index] && index >= 0 && index < bars.length) {
                bars[index].classList.add(className);
            }
        });

        const delay = duration || (101 - this.speed);
        await this.sleep(delay);
    }

    private async swapBars(i: number, j: number): Promise<void> {
        if (this.isPaused) await this.waitForUnpause();
        if (!this.isSorting) return;

        const bars = this.elements.arrayBars.children;
        const bar1 = bars[i] as HTMLElement;
        const bar2 = bars[j] as HTMLElement;

        if (!bar1 || !bar2) return;

        // Swap array values
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];

        // Update visual heights
        const temp = bar1.style.height;
        bar1.style.height = bar2.style.height;
        bar2.style.height = temp;

        // Update data attributes
        const tempValue = bar1.getAttribute('data-value');
        bar1.setAttribute('data-value', bar2.getAttribute('data-value') || '');
        bar2.setAttribute('data-value', tempValue || '');

        this.swaps++;
        this.updateStats();

        await this.highlightBars([i, j], 'swapping');
    }

    private async compare(i: number, j: number): Promise<boolean> {
        if (this.isPaused) await this.waitForUnpause();
        if (!this.isSorting) return false;

        this.comparisons++;
        this.updateStats();

        await this.highlightBars([i, j], 'comparing');
        return this.array[i] > this.array[j];
    }

    private async markSorted(indices: number[]): Promise<void> {
        if (!this.isSorting) return;

        const bars = this.elements.arrayBars.children;
        indices.forEach(index => {
            if (bars[index] && index >= 0 && index < bars.length) {
                bars[index].classList.remove('comparing', 'swapping', 'pivot');
                bars[index].classList.add('sorted');
            }
        });

        await this.sleep(50);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async waitForUnpause(): Promise<void> {
        while (this.isPaused && this.isSorting) {
            await this.sleep(100);
        }
    }

    private updateStats(): void {
        this.elements.comparisons.textContent = this.comparisons.toString();
        this.elements.swaps.textContent = this.swaps.toString();
        if (this.startTime) {
            this.elements.timeElapsed.textContent = `${Date.now() - this.startTime}ms`;
        }
    }

    private resetStats(): void {
        this.comparisons = 0;
        this.swaps = 0;
        this.elements.comparisons.textContent = '0';
        this.elements.swaps.textContent = '0';
        this.elements.timeElapsed.textContent = '0ms';
        this.elements.progressBar.style.width = '0%';
    }

    private updateAlgorithmInfo(): void {
        const alg = this.algorithms[this.currentAlgorithm];
        if (alg) {
            this.elements.currentAlgorithm.textContent = alg.name;
            this.elements.timeComplexity.textContent = alg.complexity;
            this.elements.algorithmDesc.textContent = alg.description;
        }
    }

    private updateProgress(current: number, total: number): void {
        const progress = Math.min((current / total) * 100, 100);
        this.elements.progressBar.style.width = `${progress}%`;
    }

    private async startSorting(): Promise<void> {
        if (this.isSorting) return;

        this.isSorting = true;
        this.isPaused = false;
        this.startTime = Date.now();

        // Update UI
        this.elements.startBtn.style.display = 'none';
        this.elements.pauseBtn.style.display = 'inline-flex';
        this.elements.generateBtn.disabled = true;
        this.elements.algorithmSelect.disabled = true;
        this.elements.arraySize.disabled = true;
        this.elements.inputType.disabled = true;
        document.body.classList.add('sorting-active');

        try {
            const methodName = `${this.currentAlgorithm}Sort`;
            if (typeof (this as any)[methodName] === 'function') {
                await (this as any)[methodName]();
            }
            if (this.isSorting) {
                await this.markSorted(Array.from({ length: this.array.length }, (_, i) => i));
                this.elements.progressBar.style.width = '100%';
            }
        } catch (error) {
            console.error('Sorting error:', error);
        }

        this.finishSorting();
    }

    private togglePause(): void {
        if (!this.isSorting) return;

        this.isPaused = !this.isPaused;
        this.elements.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        this.elements.pauseBtn.className = this.isPaused ? 'btn btn--primary' : 'btn btn--outline';
    }

    private stopSorting(): void {
        this.isSorting = false;
        this.isPaused = false;
        this.finishSorting();
    }

    private resetArray(): void {
        this.stopSorting();
        this.array = [...this.originalArray];
        this.renderArray();
        this.resetStats();
    }

    private finishSorting(): void {
        this.isSorting = false;
        this.isPaused = false;

        // Update UI
        this.elements.startBtn.style.display = 'inline-flex';
        this.elements.pauseBtn.style.display = 'none';
        this.elements.pauseBtn.textContent = 'Pause';
        this.elements.pauseBtn.className = 'btn btn--outline';
        this.elements.generateBtn.disabled = false;
        this.elements.algorithmSelect.disabled = false;
        this.elements.arraySize.disabled = false;
        this.elements.inputType.disabled = false;
        document.body.classList.remove('sorting-active');
    }

    // Sorting Algorithms
    private async bubbleSort(): Promise<void> {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isSorting) return;
                if (await this.compare(j, j + 1)) {
                    await this.swapBars(j, j + 1);
                    swapped = true;
                }
            }
            await this.markSorted([n - i - 1]);
            this.updateProgress(i + 1, n);
            if (!swapped) break;
        }
    }

    private async selectionSort(): Promise<void> {
        const n = this.array.length;
        for (let i = 0; i < n - 1; i++) {
            if (!this.isSorting) return;
            let minIdx = i;
            await this.highlightBars([i], 'pivot');

            for (let j = i + 1; j < n; j++) {
                if (!this.isSorting) return;
                await this.highlightBars([j, minIdx], 'comparing');
                this.comparisons++;
                this.updateStats();
                if (this.array[j] < this.array[minIdx]) {
                    minIdx = j;
                }
            }

            if (minIdx !== i) {
                await this.swapBars(i, minIdx);
            }
            await this.markSorted([i]);
            this.updateProgress(i + 1, n);
        }
    }

    private async insertionSort(): Promise<void> {
        const n = this.array.length;
        await this.markSorted([0]);

        for (let i = 1; i < n; i++) {
            if (!this.isSorting) return;
            const key = this.array[i];
            let j = i - 1;

            await this.highlightBars([i], 'pivot');

            while (j >= 0 && this.array[j] > key && this.isSorting) {
                await this.highlightBars([j, j + 1], 'comparing');
                this.comparisons++;

                this.array[j + 1] = this.array[j];

                // Update visual
                const bars = this.elements.arrayBars.children;
                (bars[j + 1] as HTMLElement).style.height = (bars[j] as HTMLElement).style.height;
                (bars[j + 1] as HTMLElement).setAttribute('data-value', (bars[j] as HTMLElement).getAttribute('data-value') || '');

                this.swaps++;
                this.updateStats();
                j--;
            }

            this.array[j + 1] = key;
            const bars = this.elements.arrayBars.children;
            const maxValue = Math.max(...this.array);
            (bars[j + 1] as HTMLElement).style.height = `${(key / maxValue) * 300}px`;
            (bars[j + 1] as HTMLElement).setAttribute('data-value', key.toString());

            await this.markSorted(Array.from({ length: i + 1 }, (_, k) => k));
            this.updateProgress(i, n);
        }
    }

    private async mergeSort(): Promise<void> {
        await this.mergeSortHelper(0, this.array.length - 1);
    }

    private async mergeSortHelper(left: number, right: number): Promise<void> {
        if (left >= right || !this.isSorting) return;

        const mid = Math.floor((left + right) / 2);
        await this.mergeSortHelper(left, mid);
        await this.mergeSortHelper(mid + 1, right);
        await this.merge(left, mid, right);

        this.updateProgress(right - left + 1, this.array.length);
    }

    private async merge(left: number, mid: number, right: number): Promise<void> {
        if (!this.isSorting) return;

        const leftArr = this.array.slice(left, mid + 1);
        const rightArr = this.array.slice(mid + 1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length && this.isSorting) {
            this.comparisons++;
            this.updateStats();

            if (leftArr[i] <= rightArr[j]) {
                this.array[k] = leftArr[i];
                i++;
            } else {
                this.array[k] = rightArr[j];
                j++;
            }

            // Update visual
            const bars = this.elements.arrayBars.children;
            const maxValue = Math.max(...this.array);
            (bars[k] as HTMLElement).style.height = `${(this.array[k] / maxValue) * 300}px`;
            (bars[k] as HTMLElement).setAttribute('data-value', this.array[k].toString());

            await this.highlightBars([k], 'swapping');
            k++;
        }

        while (i < leftArr.length && this.isSorting) {
            this.array[k] = leftArr[i];
            const bars = this.elements.arrayBars.children;
            const maxValue = Math.max(...this.array);
            (bars[k] as HTMLElement).style.height = `${(this.array[k] / maxValue) * 300}px`;
            (bars[k] as HTMLElement).setAttribute('data-value', this.array[k].toString());
            await this.highlightBars([k], 'swapping');
            i++;
            k++;
        }

        while (j < rightArr.length && this.isSorting) {
            this.array[k] = rightArr[j];
            const bars = this.elements.arrayBars.children;
            const maxValue = Math.max(...this.array);
            (bars[k] as HTMLElement).style.height = `${(this.array[k] / maxValue) * 300}px`;
            (bars[k] as HTMLElement).setAttribute('data-value', this.array[k].toString());
            await this.highlightBars([k], 'swapping');
            j++;
            k++;
        }
    }

    private async quickSort(): Promise<void> {
        await this.quickSortHelper(0, this.array.length - 1);
    }

    private async quickSortHelper(low: number, high: number): Promise<void> {
        if (low < high && this.isSorting) {
            const pi = await this.partition(low, high);
            await this.quickSortHelper(low, pi - 1);
            await this.quickSortHelper(pi + 1, high);
        }
    }

    private async partition(low: number, high: number): Promise<number> {
        if (!this.isSorting) return low;

        const pivot = this.array[high];
        await this.highlightBars([high], 'pivot');

        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (!this.isSorting) return i + 1;

            await this.highlightBars([j, high], 'comparing');
            this.comparisons++;
            this.updateStats();

            if (this.array[j] < pivot) {
                i++;
                if (i !== j) {
                    await this.swapBars(i, j);
                }
            }
        }

        await this.swapBars(i + 1, high);
        this.updateProgress(high - low + 1, this.array.length);
        return i + 1;
    }

    private async heapSort(): Promise<void> {
        const n = this.array.length;

        // Build heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }

        // Extract elements from heap
        for (let i = n - 1; i > 0; i--) {
            if (!this.isSorting) return;
            await this.swapBars(0, i);
            await this.heapify(i, 0);
            await this.markSorted([i]);
            this.updateProgress(n - i, n);
        }
    }

    private async heapify(n: number, i: number): Promise<void> {
        if (!this.isSorting) return;

        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n) {
            await this.highlightBars([left, largest], 'comparing');
            this.comparisons++;
            this.updateStats();
            if (this.array[left] > this.array[largest]) {
                largest = left;
            }
        }

        if (right < n) {
            await this.highlightBars([right, largest], 'comparing');
            this.comparisons++;
            this.updateStats();
            if (this.array[right] > this.array[largest]) {
                largest = right;
            }
        }

        if (largest !== i) {
            await this.swapBars(i, largest);
            await this.heapify(n, largest);
        }
    }

    private async radixSort(): Promise<void> {
        const max = Math.max(...this.array);
        const maxDigits = max.toString().length;

        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            if (!this.isSorting) return;
            await this.countingSortForRadix(exp);
            this.updateProgress(Math.log10(exp) + 1, maxDigits);
        }
    }

    private async countingSortForRadix(exp: number): Promise<void> {
        const n = this.array.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);

        // Count occurrences
        for (let i = 0; i < n; i++) {
            if (!this.isSorting) return;
            const digit = Math.floor(this.array[i] / exp) % 10;
            count[digit]++;
            await this.highlightBars([i], 'comparing');
        }

        // Cumulative count
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        // Build output array
        for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(this.array[i] / exp) % 10;
            output[count[digit] - 1] = this.array[i];
            count[digit]--;
        }

        // Copy back to original array
        for (let i = 0; i < n; i++) {
            if (!this.isSorting) return;
            this.array[i] = output[i];

            const bars = this.elements.arrayBars.children;
            const maxValue = Math.max(...this.array);
            (bars[i] as HTMLElement).style.height = `${(this.array[i] / maxValue) * 300}px`;
            (bars[i] as HTMLElement).setAttribute('data-value', this.array[i].toString());

            await this.highlightBars([i], 'swapping');
        }
    }

    private async countingSort(): Promise<void> {
        const max = Math.max(...this.array);
        const min = Math.min(...this.array);
        const range = max - min + 1;
        const count = new Array(range).fill(0);
        const output = new Array(this.array.length);

        // Count occurrences
        for (let i = 0; i < this.array.length; i++) {
            if (!this.isSorting) return;
            count[this.array[i] - min]++;
            await this.highlightBars([i], 'comparing');
        }

        // Cumulative count
        for (let i = 1; i < range; i++) {
            count[i] += count[i - 1];
        }

        // Build output array
        for (let i = this.array.length - 1; i >= 0; i--) {
            if (!this.isSorting) return;
            output[count[this.array[i] - min] - 1] = this.array[i];
            count[this.array[i] - min]--;
        }

        // Copy back
        for (let i = 0; i < this.array.length; i++) {
            if (!this.isSorting) return;
            this.array[i] = output[i];

            const bars = this.elements.arrayBars.children;
            const maxValue = Math.max(...this.array);
            (bars[i] as HTMLElement).style.height = `${(this.array[i] / maxValue) * 300}px`;
            (bars[i] as HTMLElement).setAttribute('data-value', this.array[i].toString());

            await this.highlightBars([i], 'swapping');
            this.updateProgress(i + 1, this.array.length);
        }
    }

    private async shellSort(): Promise<void> {
        const n = this.array.length;

        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i++) {
                if (!this.isSorting) return;

                const temp = this.array[i];
                let j = i;

                await this.highlightBars([i], 'pivot');

                while (j >= gap && this.array[j - gap] > temp && this.isSorting) {
                    await this.highlightBars([j, j - gap], 'comparing');
                    this.comparisons++;

                    this.array[j] = this.array[j - gap];

                    const bars = this.elements.arrayBars.children;
                    (bars[j] as HTMLElement).style.height = (bars[j - gap] as HTMLElement).style.height;
                    (bars[j] as HTMLElement).setAttribute('data-value', (bars[j - gap] as HTMLElement).getAttribute('data-value') || '');

                    this.swaps++;
                    this.updateStats();

                    j -= gap;
                }

                this.array[j] = temp;
                const bars = this.elements.arrayBars.children;
                const maxValue = Math.max(...this.array);
                (bars[j] as HTMLElement).style.height = `${(temp / maxValue) * 300}px`;
                (bars[j] as HTMLElement).setAttribute('data-value', temp.toString());

                this.updateProgress(i + 1, n);
            }
        }
    }

    private async cocktailSort(): Promise<void> {
        let start = 0;
        let end = this.array.length - 1;
        let swapped = true;

        while (swapped && this.isSorting) {
            swapped = false;

            // Forward pass
            for (let i = start; i < end; i++) {
                if (!this.isSorting) return;
                if (await this.compare(i, i + 1)) {
                    await this.swapBars(i, i + 1);
                    swapped = true;
                }
            }

            if (!swapped) break;

            await this.markSorted([end]);
            end--;
            swapped = false;

            // Backward pass
            for (let i = end; i > start; i--) {
                if (!this.isSorting) return;
                if (await this.compare(i - 1, i)) {
                    await this.swapBars(i - 1, i);
                    swapped = true;
                }
            }

            await this.markSorted([start]);
            start++;
            this.updateProgress(start + (this.array.length - end), this.array.length);
        }
    }

    private async bucketSort(): Promise<void> {
        const n = this.array.length;
        const max = Math.max(...this.array);
        const min = Math.min(...this.array);
        const bucketCount = Math.floor(Math.sqrt(n));
        const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

        // Distribute elements into buckets
        for (let i = 0; i < n; i++) {
            if (!this.isSorting) return;
            const bucketIndex = Math.floor((this.array[i] - min) / (max - min + 1) * bucketCount);
            const actualIndex = Math.min(bucketIndex, bucketCount - 1);
            buckets[actualIndex].push(this.array[i]);
            await this.highlightBars([i], 'comparing');
        }

        // Sort individual buckets and concatenate
        let index = 0;
        for (let i = 0; i < bucketCount; i++) {
            if (!this.isSorting) return;
            buckets[i].sort((a, b) => a - b);

            for (let j = 0; j < buckets[i].length; j++) {
                if (!this.isSorting) return;
                this.array[index] = buckets[i][j];

                const bars = this.elements.arrayBars.children;
                const maxValue = Math.max(...this.array);
                (bars[index] as HTMLElement).style.height = `${(this.array[index] / maxValue) * 300}px`;
                (bars[index] as HTMLElement).setAttribute('data-value', this.array[index].toString());

                await this.highlightBars([index], 'swapping');
                index++;
            }

            this.updateProgress(index, n);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SortingVisualizer();
});
