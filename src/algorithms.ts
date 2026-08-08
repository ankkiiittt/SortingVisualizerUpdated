export interface SortStep {
  type: 'compare' | 'swap' | 'overwrite' | 'pivot' | 'sorted';
  indices: number[];
  array: number[];
}

// BUBBLE SORT
export function getBubbleSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ type: 'compare', indices: [j, j + 1], array: [...arr] });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({ type: 'swap', indices: [j, j + 1], array: [...arr] });
        swapped = true;
      }
    }
    steps.push({ type: 'sorted', indices: [n - i - 1], array: [...arr] });
    if (!swapped) {
      const remaining: number[] = [];
      for (let k = 0; k < n - i - 1; k++) remaining.push(k);
      steps.push({ type: 'sorted', indices: remaining, array: [...arr] });
      break;
    }
  }
  return steps;
}

// SELECTION SORT
export function getSelectionSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({ type: 'pivot', indices: [i], array: [...arr] });
    for (let j = i + 1; j < n; j++) {
      steps.push({ type: 'compare', indices: [j, minIdx], array: [...arr] });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({ type: 'swap', indices: [i, minIdx], array: [...arr] });
    }
    steps.push({ type: 'sorted', indices: [i], array: [...arr] });
  }
  steps.push({ type: 'sorted', indices: [n - 1], array: [...arr] });
  return steps;
}

// INSERTION SORT
export function getInsertionSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  steps.push({ type: 'sorted', indices: [0], array: [...arr] });
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    steps.push({ type: 'pivot', indices: [i], array: [...arr] });
    while (j >= 0 && arr[j] > key) {
      steps.push({ type: 'compare', indices: [j, j + 1], array: [...arr] });
      arr[j + 1] = arr[j];
      steps.push({ type: 'overwrite', indices: [j + 1], array: [...arr] });
      j--;
    }
    arr[j + 1] = key;
    steps.push({ type: 'overwrite', indices: [j + 1], array: [...arr] });
    
    const sortedSoFar = Array.from({ length: i + 1 }, (_, k) => k);
    steps.push({ type: 'sorted', indices: sortedSoFar, array: [...arr] });
  }
  return steps;
}

// MERGE SORT
export function getMergeSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];

  function merge(left: number, mid: number, right: number) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({ type: 'compare', indices: [left + i, mid + 1 + j], array: [...arr] });
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        steps.push({ type: 'overwrite', indices: [k], array: [...arr] });
        i++;
      } else {
        arr[k] = rightArr[j];
        steps.push({ type: 'overwrite', indices: [k], array: [...arr] });
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      steps.push({ type: 'overwrite', indices: [k], array: [...arr] });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      steps.push({ type: 'overwrite', indices: [k], array: [...arr] });
      j++;
      k++;
    }
  }

  function divide(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    divide(left, mid);
    divide(mid + 1, right);
    merge(left, mid, right);
  }

  divide(0, arr.length - 1);
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, k) => k), array: [...arr] });
  return steps;
}

// QUICK SORT
export function getQuickSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    steps.push({ type: 'pivot', indices: [high], array: [...arr] });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ type: 'compare', indices: [j, high], array: [...arr] });
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({ type: 'swap', indices: [i, j], array: [...arr] });
        }
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ type: 'swap', indices: [i + 1, high], array: [...arr] });
    steps.push({ type: 'sorted', indices: [i + 1], array: [...arr] });
    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    } else if (low === high) {
      steps.push({ type: 'sorted', indices: [low], array: [...arr] });
    }
  }

  sort(0, arr.length - 1);
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, k) => k), array: [...arr] });
  return steps;
}

// HEAP SORT
export function getHeapSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  function heapify(size: number, idx: number) {
    let largest = idx;
    const left = 2 * idx + 1;
    const right = 2 * idx + 2;

    if (left < size) {
      steps.push({ type: 'compare', indices: [left, largest], array: [...arr] });
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < size) {
      steps.push({ type: 'compare', indices: [right, largest], array: [...arr] });
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest !== idx) {
      [arr[idx], arr[largest]] = [arr[largest], arr[idx]];
      steps.push({ type: 'swap', indices: [idx, largest], array: [...arr] });
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    steps.push({ type: 'swap', indices: [0, i], array: [...arr] });
    steps.push({ type: 'sorted', indices: [i], array: [...arr] });
    heapify(i, 0);
  }
  steps.push({ type: 'sorted', indices: [0], array: [...arr] });
  return steps;
}

// RADIX SORT
export function getRadixSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  const max = Math.max(...arr);

  function countingSortForRadix(exp: number) {
    const output = new Array(n);
    const count = new Array(10).fill(0);
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
      steps.push({ type: 'compare', indices: [i], array: [...arr] });
    }
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      steps.push({ type: 'overwrite', indices: [i], array: [...arr] });
    }
  }

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortForRadix(exp);
  }
  steps.push({ type: 'sorted', indices: Array.from({ length: n }, (_, k) => k), array: [...arr] });
  return steps;
}

// COUNTING SORT
export function getCountingSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const range = max - min + 1;
  const count = new Array(range).fill(0);
  const output = new Array(n);

  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++;
    steps.push({ type: 'compare', indices: [i], array: [...arr] });
  }
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }
  for (let i = n - 1; i >= 0; i--) {
    output[count[arr[i] - min] - 1] = arr[i];
    count[arr[i] - min]--;
  }
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
    steps.push({ type: 'overwrite', indices: [i], array: [...arr] });
  }
  steps.push({ type: 'sorted', indices: Array.from({ length: n }, (_, k) => k), array: [...arr] });
  return steps;
}

// SHELL SORT
export function getShellSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      steps.push({ type: 'pivot', indices: [i], array: [...arr] });
      while (j >= gap && arr[j - gap] > temp) {
        steps.push({ type: 'compare', indices: [j, j - gap], array: [...arr] });
        arr[j] = arr[j - gap];
        steps.push({ type: 'overwrite', indices: [j], array: [...arr] });
        j -= gap;
      }
      arr[j] = temp;
      steps.push({ type: 'overwrite', indices: [j], array: [...arr] });
    }
  }
  steps.push({ type: 'sorted', indices: Array.from({ length: n }, (_, k) => k), array: [...arr] });
  return steps;
}

// COCKTAIL SORT
export function getCocktailSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  let start = 0;
  let end = arr.length - 1;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      steps.push({ type: 'compare', indices: [i, i + 1], array: [...arr] });
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        steps.push({ type: 'swap', indices: [i, i + 1], array: [...arr] });
        swapped = true;
      }
    }
    if (!swapped) break;
    steps.push({ type: 'sorted', indices: [end], array: [...arr] });
    end--;
    swapped = false;
    for (let i = end - 1; i >= start; i--) {
      steps.push({ type: 'compare', indices: [i, i + 1], array: [...arr] });
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        steps.push({ type: 'swap', indices: [i, i + 1], array: [...arr] });
        swapped = true;
      }
    }
    steps.push({ type: 'sorted', indices: [start], array: [...arr] });
    start++;
  }
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, k) => k), array: [...arr] });
  return steps;
}

// BUCKET SORT
export function getBucketSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const bucketCount = Math.floor(Math.sqrt(n));
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
  
  for (let i = 0; i < n; i++) {
    const bucketIndex = Math.floor((arr[i] - min) / (max - min + 1) * bucketCount);
    const actualIndex = Math.min(bucketIndex, bucketCount - 1);
    buckets[actualIndex].push(arr[i]);
    steps.push({ type: 'compare', indices: [i], array: [...arr] });
  }
  
  let index = 0;
  for (let i = 0; i < bucketCount; i++) {
    buckets[i].sort((a, b) => a - b);
    for (let j = 0; j < buckets[i].length; j++) {
      arr[index] = buckets[i][j];
      steps.push({ type: 'overwrite', indices: [index], array: [...arr] });
      index++;
    }
  }
  steps.push({ type: 'sorted', indices: Array.from({ length: n }, (_, k) => k), array: [...arr] });
  return steps;
}
