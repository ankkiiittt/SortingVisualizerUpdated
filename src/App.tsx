import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Square, 
  Activity, 
  RefreshCw, 
  Clock, 
  BarChart3
} from 'lucide-react';
import {
  SortStep,
  getBubbleSortSteps,
  getSelectionSortSteps,
  getInsertionSortSteps,
  getMergeSortSteps,
  getQuickSortSteps,
  getHeapSortSteps,
  getRadixSortSteps,
  getCountingSortSteps,
  getShellSortSteps,
  getCocktailSortSteps,
  getBucketSortSteps
} from './algorithms';

const ALGORITHMS = {
  bubble: { name: 'Bubble Sort', complexity: 'O(n²)', description: 'Compares adjacent elements and swaps them if they are in the wrong order. Repeatedly passes through the list until sorted.' },
  selection: { name: 'Selection Sort', complexity: 'O(n²)', description: 'Divides the array into sorted and unsorted parts. Finds the minimum element from the unsorted part and swaps it to the beginning.' },
  insertion: { name: 'Insertion Sort', complexity: 'O(n²)', description: 'Builds the final sorted array one element at a time by repeatedly inserting an unsorted element into its correct place.' },
  merge: { name: 'Merge Sort', complexity: 'O(n log n)', description: 'A divide-and-conquer algorithm. Divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.' },
  quick: { name: 'Quick Sort', complexity: 'O(n log n)', description: 'Selects an element as pivot and partitions the surrounding array around the pivot, placing smaller elements to the left and larger to the right.' },
  heap: { name: 'Heap Sort', complexity: 'O(n log n)', description: 'Visualizes the array as a binary heap tree. Builds a max heap first, then repeatedly extracts the maximum element and rebuilds the heap.' },
  radix: { name: 'Radix Sort', complexity: 'O(d×n)', description: 'Non-comparative integer sorting algorithm. Groups keys by individual digits that share the same significant position and value.' },
  counting: { name: 'Counting Sort', complexity: 'O(n+k)', description: 'Non-comparative sorting algorithm. Counts the number of objects having distinct key values and uses arithmetic to determine their positions.' },
  shell: { name: 'Shell Sort', complexity: 'O(n log n)', description: 'An optimization over insertion sort. Compares elements separated by a gap sequence that decreases over time.' },
  cocktail: { name: 'Cocktail Sort', complexity: 'O(n²)', description: 'Also known as bidirectional bubble sort. Traverses through the list in both directions alternately, bubble-sorting both ways.' },
  bucket: { name: 'Bucket Sort', complexity: 'O(n²)', description: 'Distributes elements into multiple buckets, sorts each bucket individually (using insertion sort or recursion), and concatenates.' }
};

type AlgType = keyof typeof ALGORITHMS;

export default function App() {
  // Config state
  const [algorithm, setAlgorithm] = useState<AlgType>('bubble');
  const [arraySize, setArraySize] = useState<number>(50);
  const [speed, setSpeed] = useState<number>(100); // 1 to 200 slider
  const [inputType, setInputType] = useState<string>('random');

  // Array and sorting state
  const [array, setArray] = useState<number[]>([]);
  const [originalArray, setOriginalArray] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Statistics
  const [comparisonsCount, setComparisonsCount] = useState<number>(0);
  const [swapsCount, setSwapsCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  // Active highlights during animation
  const [activeIndices, setActiveIndices] = useState<{
    comparing: number[];
    swapping: number[];
    pivot: number[];
    sorted: Set<number>;
  }>({
    comparing: [],
    swapping: [],
    pivot: [],
    sorted: new Set()
  });

  // Generate initial array on mount
  useEffect(() => {
    generateArray();
  }, []);

  // Handle generation when size or inputType changes
  useEffect(() => {
    generateArray(arraySize, inputType);
  }, [arraySize, inputType]);

  // Main playback animation loop
  useEffect(() => {
    if (!isSorting || isPaused) return;

    if (currentStepIndex >= steps.length) {
      setIsSorting(false);
      setActiveIndices(prev => ({
        ...prev,
        comparing: [],
        swapping: [],
        pivot: [],
        sorted: new Set(Array.from({ length: array.length }, (_, i) => i))
      }));
      return;
    }

    // Playback speed mapping: 1 (slow, 250ms) to 200 (fast, 1ms)
    const delay = Math.max(1, 201 - speed);

    const timer = setTimeout(() => {
      const step = steps[currentStepIndex];
      setArray(step.array);

      setActiveIndices(prev => {
        const newSorted = new Set(prev.sorted);
        if (step.type === 'sorted') {
          step.indices.forEach(idx => newSorted.add(idx));
        }
        return {
          comparing: step.type === 'compare' ? step.indices : [],
          swapping: (step.type === 'swap' || step.type === 'overwrite') ? step.indices : [],
          pivot: step.type === 'pivot' ? step.indices : [],
          sorted: newSorted
        };
      });

      if (step.type === 'compare') {
        setComparisonsCount(prev => prev + 1);
      } else if (step.type === 'swap' || step.type === 'overwrite') {
        setSwapsCount(prev => prev + 1);
      }

      setCurrentStepIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isSorting, isPaused, currentStepIndex, steps, speed, array.length]);

  // Real-time duration timer
  useEffect(() => {
    if (!isSorting || isPaused) return;
    const timerInterval = setInterval(() => {
      setTimeElapsed(Date.now() - startTime);
    }, 10);
    return () => clearInterval(timerInterval);
  }, [isSorting, isPaused, startTime]);

  // Generate new array function
  const generateArray = (size = arraySize, type = inputType) => {
    const newArray: number[] = [];
    switch (type) {
      case 'random':
        for (let i = 0; i < size; i++) {
          newArray.push(Math.floor(Math.random() * 290) + 15);
        }
        break;
      case 'nearly-sorted':
        for (let i = 0; i < size; i++) {
          newArray.push(i * 5 + 15);
        }
        // Shuffle a few elements
        for (let i = 0; i < size * 0.15; i++) {
          const idx1 = Math.floor(Math.random() * size);
          const idx2 = Math.floor(Math.random() * size);
          [newArray[idx1], newArray[idx2]] = [newArray[idx2], newArray[idx1]];
        }
        break;
      case 'reversed':
        for (let i = 0; i < size; i++) {
          newArray.push((size - i) * 5 + 15);
        }
        break;
      case 'few-unique':
        const values = [40, 90, 140, 190, 240, 290];
        for (let i = 0; i < size; i++) {
          newArray.push(values[Math.floor(Math.random() * values.length)]);
        }
        break;
    }
    setArray(newArray);
    setOriginalArray([...newArray]);
    resetAnimationStates();
  };

  const resetAnimationStates = () => {
    setIsSorting(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setSteps([]);
    setComparisonsCount(0);
    setSwapsCount(0);
    setTimeElapsed(0);
    setActiveIndices({
      comparing: [],
      swapping: [],
      pivot: [],
      sorted: new Set()
    });
  };

  // Start sorting execution
  const startSorting = () => {
    if (isSorting) return;

    let generatedSteps: SortStep[] = [];
    switch (algorithm) {
      case 'bubble': generatedSteps = getBubbleSortSteps(array); break;
      case 'selection': generatedSteps = getSelectionSortSteps(array); break;
      case 'insertion': generatedSteps = getInsertionSortSteps(array); break;
      case 'merge': generatedSteps = getMergeSortSteps(array); break;
      case 'quick': generatedSteps = getQuickSortSteps(array); break;
      case 'heap': generatedSteps = getHeapSortSteps(array); break;
      case 'radix': generatedSteps = getRadixSortSteps(array); break;
      case 'counting': generatedSteps = getCountingSortSteps(array); break;
      case 'shell': generatedSteps = getShellSortSteps(array); break;
      case 'cocktail': generatedSteps = getCocktailSortSteps(array); break;
      case 'bucket': generatedSteps = getBucketSortSteps(array); break;
    }

    setSteps(generatedSteps);
    setCurrentStepIndex(0);
    setComparisonsCount(0);
    setSwapsCount(0);
    setTimeElapsed(0);
    setStartTime(Date.now());
    setIsSorting(true);
    setIsPaused(false);
    setActiveIndices({
      comparing: [],
      swapping: [],
      pivot: [],
      sorted: new Set()
    });
  };

  const togglePause = () => {
    if (!isSorting) return;
    if (isPaused) {
      // Shift startTime to exclude paused duration
      setStartTime(Date.now() - timeElapsed);
    }
    setIsPaused(!isPaused);
  };

  const stopSorting = () => {
    resetAnimationStates();
    setArray([...originalArray]);
  };

  const resetArray = () => {
    resetAnimationStates();
    setArray([...originalArray]);
  };

  const maxVal = Math.max(...array, 1);
  const progressPercent = steps.length > 0 ? (currentStepIndex / steps.length) * 100 : 0;

  return (
    <div className="app-wrapper">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="app-container">
      {/* HEADER SECTION */}
      <header className="app-header glass-panel">
        <div className="brand-section">
          <div className="brand-icon">
            <BarChart3 size={28} />
          </div>
          <div className="brand-title">
            <h1>Sorting Visualizer</h1>
            <p>Interactive algorithm sandbox in React & TypeScript</p>
          </div>
        </div>
        <div className="action-bar">

          {!isSorting ? (
            <button className="btn btn-primary" onClick={startSorting} disabled={array.length === 0}>
              <Play size={18} /> Start Visualizing
            </button>
          ) : (
            <button className="btn btn-primary" onClick={togglePause}>
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}

          <button className="btn btn-outline" onClick={resetArray} disabled={isSorting && !isPaused}>
            <RotateCcw size={18} /> Reset Array
          </button>

          {(isSorting) && (
            <button className="btn btn-outline btn-danger" onClick={stopSorting}>
              <Square size={18} /> Stop
            </button>
          )}
        </div>
      </header>

      {/* SETTINGS CONTROL CARD */}
      <section className="glass-panel controls-grid">
        <div className="control-item">
          <label className="control-label">
            <span>Algorithm</span>
          </label>
          <div className="select-wrapper">
            <select
              className="select-control"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as AlgType)}
              disabled={isSorting}
            >
              {Object.entries(ALGORITHMS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="control-item">
          <label className="control-label">
            <span>Array Size</span>
            <span className="control-value">{arraySize}</span>
          </label>
          <input
            type="range"
            min="10"
            max="150"
            className="slider-control"
            value={arraySize}
            onChange={(e) => setArraySize(parseInt(e.target.value))}
            disabled={isSorting}
          />
        </div>

        <div className="control-item">
          <label className="control-label">
            <span>Speed Delay</span>
            <span className="control-value">{speed}</span>
          </label>
          <input
            type="range"
            min="1"
            max="200"
            className="slider-control"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
          />
        </div>

        <div className="control-item">
          <label className="control-label">
            <span>Input Distribution</span>
          </label>
          <div className="select-wrapper">
            <select
              className="select-control"
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              disabled={isSorting}
            >
              <option value="random">Randomly Shuffled</option>
              <option value="nearly-sorted">Nearly Sorted</option>
              <option value="reversed">Reversed / Descending</option>
              <option value="few-unique">Few Unique Values</option>
            </select>
          </div>
        </div>
      </section>

      {/* DASHBOARD STATISTICS CARD */}
      <section className="stats-dashboard">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper">
            <Activity size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-name">Comparisons</span>
            <span className="stat-value">{comparisonsCount}</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper">
            <RefreshCw size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-name">Swaps / Overwrites</span>
            <span className="stat-value">{swapsCount}</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-name">Time Elapsed</span>
            <span className="stat-value">{timeElapsed}ms</span>
          </div>
        </div>
      </section>

      {/* VISUALIZER SCREEN */}
      <main className="visualizer-card glass-panel">
        <div className="progress-track">
          <div className="progress-thumb" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="bars-container">
          {array.map((value, idx) => {
            let barState = 'default';
            if (activeIndices.comparing.includes(idx)) barState = 'comparing';
            else if (activeIndices.swapping.includes(idx)) barState = 'swapping';
            else if (activeIndices.pivot.includes(idx)) barState = 'pivot';
            else if (activeIndices.sorted.has(idx)) barState = 'sorted';

            return (
              <div
                key={idx}
                className={`bar ${barState}`}
                style={{ height: `${(value / maxVal) * 100}%` }}
                title={`Value: ${value}`}
              />
            );
          })}
        </div>
      </main>

      {/* ALGORITHM META / LEGEND PANEL */}
      <section className="meta-panel glass-panel">
        <div>
          <div className="info-header">
            <h3>{ALGORITHMS[algorithm].name}</h3>
            <span className="complexity-badge">Worst Complexity: {ALGORITHMS[algorithm].complexity}</span>
          </div>
          <div className="info-body">
            <p>{ALGORITHMS[algorithm].description}</p>
          </div>
        </div>

        <div className="legend-panel">
          <h4 className="legend-title">Color Legend</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color default"></div>
              <span>Unsorted</span>
            </div>
            <div className="legend-item">
              <div className="legend-color comparing"></div>
              <span>Comparing</span>
            </div>
            <div className="legend-item">
              <div className="legend-color swapping"></div>
              <span>Swap / Write</span>
            </div>
            <div className="legend-item">
              <div className="legend-color pivot"></div>
              <span>Pivot</span>
            </div>
            <div className="legend-item">
              <div className="legend-color sorted"></div>
              <span>Sorted</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  );
}
