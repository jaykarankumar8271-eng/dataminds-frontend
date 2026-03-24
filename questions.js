// ============================================================
// DataMinds Test Series - Data Structures
// Based on BPSC TRE 1.0/2.0/3.0/4.0 + Bihar STET CS PYQ Analysis
// 20 Tests × 20 Questions = 400 Questions Total
// ============================================================

const ALL_TESTS = [

// ==================== TEST 01 ====================
{
  id: 1,
  title: "Arrays & Basic Concepts",
  subtitle: "Test 01 | Fundamentals",
  topic: "Arrays",
  icon: "📋",
  questions: [
    {
      q: "Which of the following is NOT a characteristic of an array in C/C++?",
      opts: ["Elements are stored in contiguous memory locations","Array size is fixed at compile time","Elements can be of different data types","Index starts from 0"],
      ans: 2, tag: "Arrays",
      exp: "In C/C++, all elements of an array must be of the same data type. Mixed data types are a feature of structures, not arrays."
    },
    {
      q: "What is the time complexity of accessing an element in an array using its index?",
      opts: ["O(n)","O(log n)","O(1)","O(n²)"],
      ans: 2, tag: "Complexity",
      exp: "Array access by index is O(1) — constant time — because elements are stored contiguously and address = base + index × size."
    },
    {
      q: "Given a 2D array A[4][5], what is the address of element A[2][3] if base address is 1000 and each element takes 4 bytes? (Row-major order)",
      opts: ["1048","1052","1056","1060"],
      ans: 1, tag: "Arrays",
      exp: "Address = Base + (row × cols + col) × size = 1000 + (2×5 + 3) × 4 = 1000 + 13×4 = 1000 + 52 = 1052."
    },
    {
      q: "Which operation is most expensive in an unsorted array?",
      opts: ["Access by index","Insertion at end","Searching an element","Deletion from end"],
      ans: 2, tag: "Arrays",
      exp: "Searching in an unsorted array requires linear scan O(n) in worst case, making it the most expensive among the options."
    },
    {
      q: "What is a 'sparse matrix'?",
      opts: ["A matrix with all zero elements","A matrix where most elements are zero","A matrix with equal rows and columns","A matrix stored in linked list"],
      ans: 1, tag: "Arrays",
      exp: "A sparse matrix is one in which most of the elements are zero. Special storage techniques like triplet form or linked lists save memory."
    },
    {
      q: "In a circular array of size n used as a queue, the condition for a FULL queue is:",
      opts: ["front == rear","(rear + 1) % n == front","rear == n - 1","front == 0"],
      ans: 1, tag: "Arrays",
      exp: "In circular array implementation of queue, it is full when (rear + 1) % n == front, leaving one slot empty to distinguish full from empty."
    },
    {
      q: "Which data structure uses LIFO (Last In First Out) principle?",
      opts: ["Queue","Stack","Linked List","Tree"],
      ans: 1, tag: "Basics",
      exp: "Stack follows LIFO — the last element pushed is the first to be popped."
    },
    {
      q: "The worst-case time complexity of linear search in an array of n elements is:",
      opts: ["O(1)","O(log n)","O(n)","O(n log n)"],
      ans: 2, tag: "Searching",
      exp: "In the worst case (element not present or at last position), linear search visits all n elements giving O(n) complexity."
    },
    {
      q: "Binary search can only be applied to:",
      opts: ["Any array","A sorted array","A linked list","A circular array"],
      ans: 1, tag: "Searching",
      exp: "Binary search requires the array to be sorted. It repeatedly divides the search space in half, giving O(log n) complexity."
    },
    {
      q: "If an array has n elements, the maximum number of comparisons in binary search is:",
      opts: ["n","n/2","⌊log₂n⌋ + 1","n²"],
      ans: 2, tag: "Searching",
      exp: "Binary search divides the array in half at each step. Maximum comparisons = ⌊log₂n⌋ + 1."
    },
    {
      q: "Which of the following is an advantage of array over linked list?",
      opts: ["Dynamic size","Easy insertion/deletion","Random access in O(1)","No memory waste"],
      ans: 2, tag: "Arrays",
      exp: "Arrays provide random access to elements using index in O(1) time. Linked lists require traversal from head, taking O(n)."
    },
    {
      q: "What is the time complexity of inserting an element at the beginning of an array of n elements?",
      opts: ["O(1)","O(log n)","O(n)","O(n²)"],
      ans: 2, tag: "Arrays",
      exp: "Inserting at the beginning requires shifting all n elements one position to the right, giving O(n) complexity."
    },
    {
      q: "In row-major order for a 2D array A[m][n], the address of A[i][j] is:",
      opts: ["Base + (i + j×m) × size","Base + (i×n + j) × size","Base + (i×m + j) × size","Base + (j×n + i) × size"],
      ans: 1, tag: "Arrays",
      exp: "Row-major: Address = Base + (i×n + j) × element_size. Each row has n elements."
    },
    {
      q: "A data structure where elements are added at one end and removed from the other end is called:",
      opts: ["Stack","Queue","Deque","Priority Queue"],
      ans: 1, tag: "Basics",
      exp: "Queue follows FIFO (First In First Out) — elements are enqueued at rear and dequeued from front."
    },
    {
      q: "What is the time complexity of bubble sort in the worst case?",
      opts: ["O(n)","O(n log n)","O(n²)","O(log n)"],
      ans: 2, tag: "Sorting",
      exp: "Bubble sort compares adjacent elements. In worst case (reverse sorted), it requires n(n-1)/2 comparisons = O(n²)."
    },
    {
      q: "Which sorting algorithm is best for nearly sorted data?",
      opts: ["Quick Sort","Merge Sort","Insertion Sort","Selection Sort"],
      ans: 2, tag: "Sorting",
      exp: "Insertion sort has O(n) best-case performance when data is nearly sorted (few inversions), making it optimal for such cases."
    },
    {
      q: "The time complexity of selection sort is:",
      opts: ["O(n)","O(n log n)","O(n²) always","O(n²) only in worst case"],
      ans: 2, tag: "Sorting",
      exp: "Selection sort always performs n(n-1)/2 comparisons regardless of input — best, average, and worst case are all O(n²)."
    },
    {
      q: "Which of the following is a stable sorting algorithm?",
      opts: ["Quick Sort","Heap Sort","Selection Sort","Merge Sort"],
      ans: 3, tag: "Sorting",
      exp: "Merge sort is stable — equal elements maintain their relative order. Quick sort, heap sort, and selection sort are generally not stable."
    },
    {
      q: "An array is stored with first element at address 200. If each element is 2 bytes, what is the address of 8th element?",
      opts: ["214","216","218","212"],
      ans: 0, tag: "Arrays",
      exp: "Address = Base + (index) × size = 200 + (8-1) × 2 = 200 + 14 = 214. (8th element has index 7)"
    },
    {
      q: "Which of the following operations on an array takes O(1) time?",
      opts: ["Search for an element","Insert at beginning","Delete from middle","Access element by index"],
      ans: 3, tag: "Arrays",
      exp: "Accessing by index is O(1) due to direct address calculation. All other operations listed require O(n) time."
    }
  ]
},

// ==================== TEST 02 ====================
{
  id: 2,
  title: "Linked Lists - Basics",
  subtitle: "Test 02 | Singly Linked List",
  topic: "Linked Lists",
  icon: "🔗",
  questions: [
    {
      q: "In a singly linked list, each node contains:",
      opts: ["Only data","Only pointer to next","Data and pointer to next node","Data and pointers to both next and previous"],
      ans: 2, tag: "Linked List",
      exp: "A singly linked list node has two fields: data (the value) and next (pointer to the next node)."
    },
    {
      q: "What is the time complexity of inserting a node at the beginning of a singly linked list?",
      opts: ["O(n)","O(log n)","O(1)","O(n²)"],
      ans: 2, tag: "Linked List",
      exp: "Insertion at beginning only requires updating the new node's next pointer and the head pointer — O(1) time."
    },
    {
      q: "To delete a node at a given position (not head or tail) in a singly linked list, you need:",
      opts: ["Only pointer to that node","Pointer to the previous node","Pointer to the next node","Head pointer only"],
      ans: 1, tag: "Linked List",
      exp: "To delete node X, you need its previous node to update: prev.next = X.next. Without prev, you cannot unlink X."
    },
    {
      q: "The time complexity of accessing the k-th element in a singly linked list is:",
      opts: ["O(1)","O(log n)","O(k)","O(n²)"],
      ans: 2, tag: "Linked List",
      exp: "Unlike arrays, linked lists have no random access. You must traverse from head to the k-th node, taking O(k) ≈ O(n) time."
    },
    {
      q: "Which of the following is an advantage of linked lists over arrays?",
      opts: ["O(1) random access","Less memory overhead","Dynamic size — no pre-allocation needed","Better cache performance"],
      ans: 2, tag: "Linked List",
      exp: "Linked lists can grow/shrink dynamically at runtime without pre-allocating memory. Arrays require fixed size at creation."
    },
    {
      q: "In a circular singly linked list, the last node points to:",
      opts: ["NULL","Itself","The first node (head)","The middle node"],
      ans: 2, tag: "Linked List",
      exp: "In a circular singly linked list, the last node's next pointer points back to the head node, forming a circle."
    },
    {
      q: "Which data structure is suitable for implementing a Round Robin CPU scheduling algorithm?",
      opts: ["Stack","Binary Tree","Circular Linked List","Priority Queue"],
      ans: 2, tag: "Linked List",
      exp: "Round Robin requires cycling through processes in order. Circular linked list naturally supports this with constant-time rotation."
    },
    {
      q: "What is the time complexity of reversing a singly linked list?",
      opts: ["O(1)","O(log n)","O(n)","O(n²)"],
      ans: 2, tag: "Linked List",
      exp: "Reversing requires visiting every node once to change its next pointer. Hence O(n) time."
    },
    {
      q: "A doubly linked list node contains:",
      opts: ["Data only","Data and one pointer","Data, prev pointer, and next pointer","Two data fields"],
      ans: 2, tag: "Linked List",
      exp: "A doubly linked list node has three fields: data, prev (pointer to previous node), and next (pointer to next node)."
    },
    {
      q: "Which linked list allows traversal in both directions?",
      opts: ["Singly Linked List","Circular Singly Linked List","Doubly Linked List","XOR Linked List (logically)"],
      ans: 2, tag: "Linked List",
      exp: "Doubly linked list has both prev and next pointers in each node, enabling traversal in both forward and backward directions."
    },
    {
      q: "Floyd's cycle detection algorithm (Tortoise and Hare) is used to detect:",
      opts: ["Sorted list","Cycle in linked list","Middle element","Palindrome"],
      ans: 1, tag: "Linked List",
      exp: "Floyd's algorithm uses two pointers (slow=1 step, fast=2 steps). If they meet, a cycle exists. It runs in O(n) time and O(1) space."
    },
    {
      q: "What is the time complexity to find the middle of a linked list using slow/fast pointer technique?",
      opts: ["O(1)","O(log n)","O(n)","O(n/2) which simplifies to O(n)"],
      ans: 2, tag: "Linked List",
      exp: "The slow pointer moves n/2 steps = O(n). While O(n/2) is technically correct, it simplifies to O(n) in Big-O notation."
    },
    {
      q: "Which application is best suited for a singly linked list?",
      opts: ["Undo-redo functionality","Implementation of a stack","Binary search","Random access of elements"],
      ans: 1, tag: "Linked List",
      exp: "Stack (push/pop from one end) maps perfectly to singly linked list operations at the head — O(1) for both."
    },
    {
      q: "In terms of memory, linked lists are:",
      opts: ["More efficient than arrays always","Less efficient due to pointer overhead","Same as arrays","More efficient for large data"],
      ans: 1, tag: "Linked List",
      exp: "Each linked list node stores extra pointer fields (4 or 8 bytes each). Arrays store only data, so linked lists have higher memory overhead."
    },
    {
      q: "To insert a node after a given node in a singly linked list (without tail access), the time complexity is:",
      opts: ["O(n)","O(log n)","O(1)","O(n²)"],
      ans: 2, tag: "Linked List",
      exp: "If you already have the pointer to the node, you only need to adjust two pointers — O(1) operation."
    },
    {
      q: "Which statement is TRUE about singly and doubly linked lists?",
      opts: ["Both use same memory per node","Doubly uses more memory but allows bidirectional traversal","Singly is slower than doubly for all operations","Doubly cannot be circular"],
      ans: 1, tag: "Linked List",
      exp: "Doubly linked list nodes have an extra prev pointer (more memory) but support bidirectional traversal and easier deletion."
    },
    {
      q: "In a singly linked list implementation of a stack, the TOP corresponds to:",
      opts: ["Tail node","Any middle node","Head node","Both head and tail"],
      ans: 2, tag: "Linked List",
      exp: "Top of stack = head of linked list. Push inserts at head (O(1)), pop removes from head (O(1))."
    },
    {
      q: "The address of the first node of a linked list is stored in:",
      opts: ["Last node","Head pointer","Tail pointer","Data field"],
      ans: 1, tag: "Linked List",
      exp: "The head pointer (or head variable) stores the address of the first node. Without it, the list cannot be accessed."
    },
    {
      q: "What does a NULL pointer in the last node of a singly linked list indicate?",
      opts: ["Error","Beginning of list","End of list","Empty list"],
      ans: 2, tag: "Linked List",
      exp: "NULL in the last node's next field marks the end of the singly linked list. Traversal stops when next == NULL."
    },
    {
      q: "Which of these is used for implementing undo functionality in text editors?",
      opts: ["Singly Linked List","Queue","Doubly Linked List","Circular Queue"],
      ans: 2, tag: "Linked List",
      exp: "Doubly linked list supports movement in both directions — forward (redo) and backward (undo) — making it ideal for this use case."
    }
  ]
},

// ==================== TEST 03 ====================
{
  id: 3,
  title: "Stacks - Theory & Applications",
  subtitle: "Test 03 | Stack Operations",
  topic: "Stacks",
  icon: "📚",
  questions: [
    {
      q: "Which principle does a Stack follow?",
      opts: ["FIFO","LIFO","LILO","FILO"],
      ans: 1, tag: "Stack",
      exp: "Stack follows LIFO (Last In First Out). FILO is same as LIFO. FIFO is Queue's principle."
    },
    {
      q: "In a stack of size n, if we push elements 1, 2, 3, 4, 5, the TOP element is:",
      opts: ["1","3","5","Depends on implementation"],
      ans: 2, tag: "Stack",
      exp: "Stack is LIFO. The last pushed element (5) is at the TOP."
    },
    {
      q: "The operation to add an element to a stack is called:",
      opts: ["Enqueue","Dequeue","Push","Pop"],
      ans: 2, tag: "Stack",
      exp: "Push adds an element to the top of the stack. Pop removes from the top."
    },
    {
      q: "What is a 'Stack Overflow' condition?",
      opts: ["Stack is empty and we try to pop","Stack is full and we try to push","Stack reaches middle","Stack has only one element"],
      ans: 1, tag: "Stack",
      exp: "Stack Overflow occurs when we try to push an element onto an already full stack."
    },
    {
      q: "Which of the following is NOT an application of Stack?",
      opts: ["Expression evaluation","Function call management","CPU Scheduling","Backtracking algorithms"],
      ans: 2, tag: "Stack",
      exp: "CPU scheduling uses queues (ready queue, priority queue), not stacks. Expression evaluation, function calls, and backtracking use stacks."
    },
    {
      q: "Convert the infix expression A+B*C to postfix:",
      opts: ["AB+C*","ABC*+","A+BC*","ABC+*"],
      ans: 1, tag: "Stack",
      exp: "B*C is evaluated first (higher precedence), then +A: postfix = A B C * +"
    },
    {
      q: "What is the postfix form of (A+B)*(C-D)?",
      opts: ["AB+CD-*","A+B*C-D","AB*CD+-","AB+*CD-"],
      ans: 0, tag: "Stack",
      exp: "Evaluate (A+B) → AB+, then (C-D) → CD-, then multiply: AB+CD-*"
    },
    {
      q: "Which data structure is used to convert infix expression to postfix?",
      opts: ["Queue","Stack","Tree","Graph"],
      ans: 1, tag: "Stack",
      exp: "An operator stack is used during infix-to-postfix conversion to hold operators based on precedence and associativity."
    },
    {
      q: "Function call management in programming uses which data structure?",
      opts: ["Queue","Stack (Call Stack)","Array","Heap"],
      ans: 1, tag: "Stack",
      exp: "Each function call creates a stack frame (activation record) pushed onto the call stack. Returns pop from the stack."
    },
    {
      q: "Evaluate the postfix expression: 5 3 + 2 *",
      opts: ["11","16","10","13"],
      ans: 1, tag: "Stack",
      exp: "Step 1: push 5, push 3. '+': pop 3,5 → push 8. Push 2. '*': pop 2,8 → push 16. Result = 16."
    },
    {
      q: "The minimum number of stacks needed to implement a queue is:",
      opts: ["1","2","3","4"],
      ans: 1, tag: "Stack",
      exp: "A queue can be implemented using 2 stacks: one for enqueue, one for dequeue. Transfer elements between stacks to simulate FIFO."
    },
    {
      q: "Which recursive algorithm naturally uses stack implicitly?",
      opts: ["Binary Search","Quick Sort","Linear Search","Bubble Sort"],
      ans: 1, tag: "Stack",
      exp: "Quick Sort uses recursion extensively. Each recursive call is managed on the call stack. Its recursion depth is O(log n) on average."
    },
    {
      q: "To check balanced parentheses in an expression, we use:",
      opts: ["Queue","Stack","Array","Tree"],
      ans: 1, tag: "Stack",
      exp: "Push opening brackets. On closing bracket, check if top matches. Pop if match; else unbalanced. Empty stack at end = balanced."
    },
    {
      q: "What is the result of pushing 1,2,3 and then popping twice from a stack?",
      opts: ["1 is popped","2 is popped, then 3","3 is popped, then 2","1 and 2 are popped"],
      ans: 2, tag: "Stack",
      exp: "Stack is LIFO. Push order: 1,2,3. Top is 3. First pop: 3. Second pop: 2."
    },
    {
      q: "If a stack is implemented using an array, the worst-case time complexity of push is:",
      opts: ["O(n)","O(log n)","O(1)","O(n²)"],
      ans: 2, tag: "Stack",
      exp: "Array-based stack push only involves: check if full, increment top, store element — all constant O(1) operations."
    },
    {
      q: "Which of the following is the prefix (Polish notation) of A+B?",
      opts: ["AB+","+AB","A+B","BA+"],
      ans: 1, tag: "Stack",
      exp: "In prefix notation, the operator comes before operands. A+B becomes +AB."
    },
    {
      q: "The 'Towers of Hanoi' problem is best solved using:",
      opts: ["Iteration only","Queue","Recursion/Stack","Linked List"],
      ans: 2, tag: "Stack",
      exp: "Towers of Hanoi has a recursive structure. The recursive solution uses O(n) stack space where n is the number of discs."
    },
    {
      q: "What is the value of TOP in an empty stack (if stack array starts at index 0)?",
      opts: ["0","1","-1","null"],
      ans: 2, tag: "Stack",
      exp: "Conventionally, TOP is initialized to -1 to indicate an empty stack. First push increments TOP to 0."
    },
    {
      q: "Which of these conversion does NOT use a stack?",
      opts: ["Infix to Postfix","Infix to Prefix","Converting decimal to binary","Sorting a nearly sorted array"],
      ans: 3, tag: "Stack",
      exp: "Sorting a nearly sorted array can use insertion sort — no explicit stack needed. The other three use stack-based algorithms."
    },
    {
      q: "In a stack-based DFS traversal of a graph, vertices are processed in which order?",
      opts: ["By weight","Level by level (BFS order)","LIFO — deepest explored first","Alphabetical order"],
      ans: 2, tag: "Stack",
      exp: "DFS uses a stack. The deepest (most recently visited) node is explored next, following LIFO principle."
    }
  ]
},

// ==================== TEST 04 ====================
{
  id: 4,
  title: "Queues & Circular Queues",
  subtitle: "Test 04 | Queue Operations",
  topic: "Queues",
  icon: "🚶",
  questions: [
    {
      q: "Which principle does a Queue follow?",
      opts: ["LIFO","FIFO","LILO","FILO"],
      ans: 1, tag: "Queue",
      exp: "Queue follows FIFO (First In First Out) — the first element inserted is the first to be removed."
    },
    {
      q: "In a queue, insertion happens at ___ and deletion happens at ___:",
      opts: ["Front, Rear","Rear, Front","Front, Front","Rear, Rear"],
      ans: 1, tag: "Queue",
      exp: "Enqueue (insert) at REAR. Dequeue (delete) from FRONT."
    },
    {
      q: "What is a 'Deque' (Double Ended Queue)?",
      opts: ["A queue with two fronts","A queue where insertion/deletion can happen at both ends","A sorted queue","A priority queue"],
      ans: 1, tag: "Queue",
      exp: "Deque allows insertion and deletion at both front and rear ends, combining features of stack and queue."
    },
    {
      q: "In a circular queue of size 5, if FRONT=2 and REAR=2, the queue is:",
      opts: ["Full","Empty","Has one element","Cannot determine"],
      ans: 3, tag: "Queue",
      exp: "When FRONT == REAR, the queue could be either empty or full depending on the implementation. Most implementations use a flag or waste one slot."
    },
    {
      q: "What is the advantage of a circular queue over a linear queue?",
      opts: ["Faster insertion","Better memory utilization (no wasted space at front)","Allows priority insertion","Unlimited size"],
      ans: 1, tag: "Queue",
      exp: "In linear queue, dequeued slots at front cannot be reused. Circular queue reuses them by wrapping REAR pointer around."
    },
    {
      q: "What is the condition to check if a circular queue (size n, using modulo) is EMPTY?",
      opts: ["FRONT == -1","REAR == -1","FRONT == REAR","REAR == n-1"],
      ans: 2, tag: "Queue",
      exp: "When FRONT == REAR (after initial state), the circular queue is empty. Initially both are set to -1 or 0 depending on implementation."
    },
    {
      q: "Which application uses a queue data structure?",
      opts: ["Recursion management","Breadth-First Search (BFS)","Depth-First Search (DFS)","Expression evaluation"],
      ans: 1, tag: "Queue",
      exp: "BFS explores nodes level by level using a queue (FIFO). DFS uses stack. Recursion and expression evaluation use stacks."
    },
    {
      q: "A priority queue differs from a regular queue in that:",
      opts: ["It holds only integers","Elements are processed by priority, not arrival order","It is always sorted","It has fixed size"],
      ans: 1, tag: "Queue",
      exp: "In a priority queue, the element with highest (or lowest) priority is dequeued first, regardless of when it was inserted."
    },
    {
      q: "Which data structure is used in CPU scheduling (Round Robin)?",
      opts: ["Stack","Queue","Binary Tree","Hash Table"],
      ans: 1, tag: "Queue",
      exp: "Round Robin scheduling maintains a queue of processes. Each process gets equal CPU time slices in FIFO order."
    },
    {
      q: "The time complexity of enqueue and dequeue operations in a queue implemented using a linked list is:",
      opts: ["O(n) for both","O(1) for both","O(n) enqueue, O(1) dequeue","O(1) enqueue, O(n) dequeue"],
      ans: 1, tag: "Queue",
      exp: "With tail pointer: enqueue at tail O(1), dequeue from head O(1)."
    },
    {
      q: "In the context of OS, which data structure manages the Ready Queue?",
      opts: ["Stack","Simple Queue or Priority Queue","Binary Search Tree","Graph"],
      ans: 1, tag: "Queue",
      exp: "The OS ready queue holds processes waiting for CPU. Simple FCFS uses queue; priority-based scheduling uses priority queue."
    },
    {
      q: "Which of the following is a disadvantage of queue over stack?",
      opts: ["Only one end accessible","Cannot be implemented with arrays","More complex pointer management","Slower access"],
      ans: 2, tag: "Queue",
      exp: "Queue needs two pointers (FRONT and REAR) and more complex circular logic. Stack only needs one pointer (TOP)."
    },
    {
      q: "An input-restricted Deque allows:",
      opts: ["Insertion only at one end, deletion at both","Deletion only at one end, insertion at both","No restriction","Only FIFO operations"],
      ans: 0, tag: "Queue",
      exp: "Input-restricted deque: insertion only at rear, deletion from both ends. Output-restricted: deletion only from front."
    },
    {
      q: "Which data structure is used in a Printer Spooler?",
      opts: ["Stack","Queue","Priority Queue","Linked List"],
      ans: 1, tag: "Queue",
      exp: "Printer spooler processes print jobs in FIFO order — first submitted, first printed — using a queue."
    },
    {
      q: "The expression 'FRONT = (FRONT + 1) % n' is used in:",
      opts: ["Linear Queue","Circular Queue","Priority Queue","Deque"],
      ans: 1, tag: "Queue",
      exp: "The modulo operation makes the FRONT wrap around from n-1 back to 0, implementing the circular behavior."
    },
    {
      q: "If we implement a queue using two stacks S1 and S2, the amortized time complexity of enqueue is:",
      opts: ["O(n)","O(log n)","O(1)","O(n²)"],
      ans: 2, tag: "Queue",
      exp: "Enqueue always pushes to S1: O(1) amortized. Dequeue may transfer all elements from S1 to S2, but each element is moved at most once."
    },
    {
      q: "In a normal (linear) array queue, after several enqueue/dequeue operations, which problem arises?",
      opts: ["Memory overflow always","FRONT pointer creates unusable space at beginning","Elements get lost","Queue becomes circular"],
      ans: 1, tag: "Queue",
      exp: "As FRONT moves right after each dequeue, positions before FRONT become wasted — this is called false overflow, solved by circular queue."
    },
    {
      q: "Which traversal algorithm of a graph uses queue?",
      opts: ["DFS","BFS","Topological Sort","Dijkstra (basic form)"],
      ans: 1, tag: "Queue",
      exp: "BFS (Breadth First Search) uses a queue to explore all neighbors at current level before going to next level."
    },
    {
      q: "Maximum number of elements in a circular queue of size n (using all n slots with a flag) is:",
      opts: ["n-1","n","n+1","2n"],
      ans: 1, tag: "Queue",
      exp: "With an isEmpty flag or a count variable, all n slots can be utilized. Without it, only n-1 to distinguish full from empty."
    },
    {
      q: "Which data structure is most appropriate for implementing a call center (serving customers in order of arrival)?",
      opts: ["Stack","Queue","Binary Heap","Hash Table"],
      ans: 1, tag: "Queue",
      exp: "Call center serves customers in FIFO order — first caller is served first. Queue is the natural data structure for this."
    }
  ]
},

// ==================== TEST 05 ====================
{
  id: 5,
  title: "Binary Trees - Fundamentals",
  subtitle: "Test 05 | Tree Properties",
  topic: "Trees",
  icon: "🌳",
  questions: [
    {
      q: "A binary tree has at most ___ children per node:",
      opts: ["1","2","3","Unlimited"],
      ans: 1, tag: "Trees",
      exp: "Binary tree: each node has AT MOST 2 children (left child and right child)."
    },
    {
      q: "The maximum number of nodes at level k of a binary tree (root at level 0) is:",
      opts: ["k","2k","2^k","k²"],
      ans: 2, tag: "Trees",
      exp: "Level 0 (root): 1 = 2⁰. Level 1: 2 = 2¹. Level k: 2^k. This is the maximum (complete binary tree property)."
    },
    {
      q: "A full binary tree of height h has how many nodes?",
      opts: ["2h","h²","2^(h+1) - 1","2^h"],
      ans: 2, tag: "Trees",
      exp: "Full (complete) binary tree of height h: total nodes = 2⁰ + 2¹ + ... + 2ʰ = 2^(h+1) - 1."
    },
    {
      q: "In-order traversal of a Binary Search Tree (BST) gives nodes in:",
      opts: ["Reverse sorted order","Level-order","Sorted (ascending) order","Random order"],
      ans: 2, tag: "Trees",
      exp: "BST property: left < root < right. In-order (Left-Root-Right) traversal visits nodes in ascending sorted order."
    },
    {
      q: "Which tree traversal visits nodes in the order: Left → Root → Right?",
      opts: ["Pre-order","Post-order","In-order","Level-order"],
      ans: 2, tag: "Trees",
      exp: "In-order: Left → Root → Right. Pre-order: Root → Left → Right. Post-order: Left → Right → Root."
    },
    {
      q: "Which traversal is used to make a copy of a binary tree?",
      opts: ["In-order","Pre-order","Post-order","Level-order"],
      ans: 1, tag: "Trees",
      exp: "Pre-order traversal processes root before children. To copy a tree, we create the root first, then left subtree, then right — pre-order."
    },
    {
      q: "Which traversal is used to delete a binary tree?",
      opts: ["Pre-order","In-order","Post-order","Level-order"],
      ans: 2, tag: "Trees",
      exp: "Post-order (Left → Right → Root) deletes children before the parent, ensuring no dangling pointers."
    },
    {
      q: "The height of a binary tree with only one node (root) is:",
      opts: ["0","1","-1","2"],
      ans: 0, tag: "Trees",
      exp: "Height = number of edges on the longest path from root to leaf. Single node has no edges, so height = 0."
    },
    {
      q: "What is a 'complete binary tree'?",
      opts: ["Every node has 0 or 2 children","All levels fully filled except possibly the last, filled from left","Root has exactly 2 children","No node has two children"],
      ans: 1, tag: "Trees",
      exp: "Complete binary tree: all levels are fully filled except possibly the last level, which is filled from left to right."
    },
    {
      q: "In a binary tree with n nodes, the number of NULL pointers is:",
      opts: ["n","n+1","n-1","2n"],
      ans: 1, tag: "Trees",
      exp: "A binary tree with n nodes has 2n pointer fields. n-1 are non-null (parent-child links). So null pointers = 2n - (n-1) = n+1."
    },
    {
      q: "A binary tree is different from a general tree because:",
      opts: ["Binary tree has parent pointers","Max 2 children per node and order of children matters","Binary tree is always sorted","Binary tree cannot be empty"],
      ans: 1, tag: "Trees",
      exp: "In binary tree, each node has AT MOST 2 children AND the distinction between left and right child is important."
    },
    {
      q: "Which traversal of a binary tree uses a queue?",
      opts: ["Pre-order","In-order","Post-order","Level-order (BFS)"],
      ans: 3, tag: "Trees",
      exp: "Level-order traversal visits nodes level by level using a queue — same as BFS traversal."
    },
    {
      q: "For a binary tree with n leaf nodes, the number of non-leaf nodes (internal nodes) having 2 children is:",
      opts: ["n","n+1","n-1","2n-1"],
      ans: 2, tag: "Trees",
      exp: "In a full binary tree (every node has 0 or 2 children): if L = leaf nodes, internal nodes = L - 1."
    },
    {
      q: "The maximum height of a binary tree with n nodes is:",
      opts: ["log₂n","n-1","n/2","√n"],
      ans: 1, tag: "Trees",
      exp: "Maximum height occurs in a skewed (degenerate) tree where each node has one child — like a linked list. Height = n-1."
    },
    {
      q: "Pre-order traversal of a tree with root A, left child B, right child C is:",
      opts: ["B-A-C","B-C-A","A-B-C","C-A-B"],
      ans: 2, tag: "Trees",
      exp: "Pre-order: Root first, then Left, then Right. Root=A, Left=B, Right=C → A-B-C."
    },
    {
      q: "Which property must hold for every node in a Binary Search Tree (BST)?",
      opts: ["Left child > parent","All right subtree values < parent","Left subtree values < parent < right subtree values","Parent = average of children"],
      ans: 2, tag: "Trees",
      exp: "BST property: for any node X, all values in left subtree < X, all values in right subtree > X."
    },
    {
      q: "What is the time complexity of searching in a balanced BST?",
      opts: ["O(1)","O(n)","O(log n)","O(n log n)"],
      ans: 2, tag: "Trees",
      exp: "Balanced BST search eliminates half the tree at each step (like binary search) — O(log n) time."
    },
    {
      q: "The minimum height of a BST with n nodes is:",
      opts: ["n","n-1","⌊log₂n⌋","n/2"],
      ans: 2, tag: "Trees",
      exp: "A perfectly balanced BST has minimum height = ⌊log₂n⌋. This is achieved when the tree is as complete as possible."
    },
    {
      q: "Post-order traversal of a tree is used in:",
      opts: ["Creating a copy of tree","Sorting BST","Evaluating expression trees","Level-order display"],
      ans: 2, tag: "Trees",
      exp: "Expression tree evaluation uses post-order: evaluate left operand, right operand, then apply operator at root."
    },
    {
      q: "A binary tree is said to be 'skewed' when:",
      opts: ["All nodes are at same level","Every node has exactly 2 children","Every node has only one child (all left or all right)","Root has no children"],
      ans: 2, tag: "Trees",
      exp: "Skewed binary tree is a degenerate tree — essentially a linked list where each node has only left OR only right child."
    }
  ]
},

// ==================== TEST 06 ====================
{
  id: 6,
  title: "BST & AVL Trees",
  subtitle: "Test 06 | Balanced Trees",
  topic: "Trees",
  icon: "⚖️",
  questions: [
    {
      q: "In a BST, inserting the sequence 50, 30, 70, 20, 40. What is the in-order traversal?",
      opts: ["50,30,70,20,40","20,30,40,50,70","70,50,40,30,20","30,20,40,50,70"],
      ans: 1, tag: "BST",
      exp: "In-order traversal of BST gives sorted ascending order: 20, 30, 40, 50, 70."
    },
    {
      q: "The balance factor of a node in an AVL tree is defined as:",
      opts: ["Height of right subtree - Height of left subtree","Height of left subtree - Height of right subtree","Number of nodes in left - right subtree","Depth of node"],
      ans: 1, tag: "AVL",
      exp: "Balance Factor = Height(Left Subtree) - Height(Right Subtree). In AVL tree, this must be in {-1, 0, +1} for every node."
    },
    {
      q: "For a valid AVL tree, the balance factor of every node must be:",
      opts: ["-1, 0, or 1","0 only","Any negative value","Any positive value"],
      ans: 0, tag: "AVL",
      exp: "AVL tree maintains height balance. Balance factor in {-1, 0, +1} ensures O(log n) height."
    },
    {
      q: "Which rotation is applied when a node is inserted in the LEFT subtree of the LEFT child (causing imbalance)?",
      opts: ["Left-Left (RR rotation)","Right-Right (LL rotation)","Left-Left (LL rotation → Right Rotation)","Double rotation"],
      ans: 2, tag: "AVL",
      exp: "LL case (insertion in left-left): Apply single Right Rotation to restore balance."
    },
    {
      q: "Which rotation is applied when a node is inserted in the RIGHT subtree of the RIGHT child?",
      opts: ["Left Rotation (RR case)","Right Rotation","Double Left Rotation","Double Right Rotation"],
      ans: 0, tag: "AVL",
      exp: "RR case (insertion in right-right): Apply single Left Rotation."
    },
    {
      q: "Left-Right (LR) case in AVL tree requires:",
      opts: ["Single left rotation","Single right rotation","Left rotation then right rotation","Right rotation then left rotation"],
      ans: 2, tag: "AVL",
      exp: "LR case: first apply Left rotation on left child, then Right rotation on the unbalanced node."
    },
    {
      q: "The worst-case time complexity of insertion in an AVL tree is:",
      opts: ["O(n)","O(n²)","O(log n)","O(1)"],
      ans: 2, tag: "AVL",
      exp: "AVL tree maintains O(log n) height. Insertion involves: search path O(log n) + at most O(log n) rotations."
    },
    {
      q: "In a BST, deleting a node with TWO children involves replacing it with:",
      opts: ["Root of right subtree","In-order predecessor or successor","Any leaf node","Parent node"],
      ans: 1, tag: "BST",
      exp: "When deleting a node with two children, replace its value with in-order predecessor (max of left subtree) or in-order successor (min of right subtree)."
    },
    {
      q: "Inserting elements 1,2,3 into an empty BST creates a:",
      opts: ["Balanced tree","Right-skewed tree","Left-skewed tree","Complete binary tree"],
      ans: 1, tag: "BST",
      exp: "Inserting 1 (root), 2 (right of 1), 3 (right of 2) creates a right-skewed tree where each node has only right child."
    },
    {
      q: "What is the height of an AVL tree with n nodes?",
      opts: ["O(n)","O(n²)","O(log n)","O(n log n)"],
      ans: 2, tag: "AVL",
      exp: "AVL tree guarantees O(log n) height by maintaining balance factor in {-1,0,1} at every node."
    },
    {
      q: "Which of these is NOT a self-balancing BST?",
      opts: ["AVL Tree","Red-Black Tree","Simple BST","Splay Tree"],
      ans: 2, tag: "BST",
      exp: "A simple BST has no self-balancing mechanism. Worst case (sorted input) gives O(n) height like a linked list."
    },
    {
      q: "Finding the minimum element in a BST requires going to:",
      opts: ["Root","Rightmost node","Leftmost node","Any leaf"],
      ans: 2, tag: "BST",
      exp: "In BST, minimum is always at the leftmost node (keep going left until no left child)."
    },
    {
      q: "Time complexity of searching in an unbalanced BST in worst case is:",
      opts: ["O(log n)","O(n)","O(1)","O(n log n)"],
      ans: 1, tag: "BST",
      exp: "Worst case: skewed BST (sorted input). Search degrades to O(n) like linear search in a linked list."
    },
    {
      q: "AVL tree was invented by:",
      opts: ["Donald Knuth","Adelson-Velsky and Landis","Charles Hoare","John Von Neumann"],
      ans: 1, tag: "AVL",
      exp: "AVL tree was invented in 1962 by Georgy Adelson-Velsky and Evgenii Landis. The 'AVL' stands for their initials."
    },
    {
      q: "Which of the following is the correct BST? (Insert: 10, 5, 15, 3, 7)",
      opts: ["In-order: 3,5,7,10,15","In-order: 10,5,15,3,7","In-order: 15,10,7,5,3","Pre-order: 3,5,7,10,15"],
      ans: 0, tag: "BST",
      exp: "BST in-order always gives sorted order: 3, 5, 7, 10, 15."
    },
    {
      q: "The number of rotations needed in an AVL tree after an insertion is at most:",
      opts: ["n","log n","2","1"],
      ans: 2, tag: "AVL",
      exp: "At most 2 rotations are needed after an insertion in an AVL tree (for LR or RL cases which require double rotation)."
    },
    {
      q: "In BST, a node has no right child. Its in-order successor is:",
      opts: ["The left child","Its parent (if it's a left child of parent)","NULL (no successor)","The root"],
      ans: 1, tag: "BST",
      exp: "If no right child, the in-order successor is the nearest ancestor for which the given node is in the left subtree."
    },
    {
      q: "Which rotation makes the right child of a node its new parent?",
      opts: ["Right Rotation","Left Rotation","Double Right Rotation","RL Rotation"],
      ans: 1, tag: "AVL",
      exp: "Left Rotation: the right child becomes the new parent, and the original node becomes the left child of the new parent."
    },
    {
      q: "What is the worst case time complexity of building a BST from n sorted elements?",
      opts: ["O(n log n)","O(n²)","O(n)","O(log n)"],
      ans: 1, tag: "BST",
      exp: "Inserting n sorted elements into BST creates a skewed tree. Each insertion is O(n) in worst case → total O(n²)."
    },
    {
      q: "Red-Black tree is preferred over AVL tree when:",
      opts: ["Searches are more frequent","Insertions and deletions are more frequent","Memory is unlimited","Tree is always complete"],
      ans: 1, tag: "BST",
      exp: "Red-Black tree has fewer rotations on insert/delete (faster writes). AVL is more strictly balanced (faster searches)."
    }
  ]
},

// ==================== TEST 07 ====================
{
  id: 7,
  title: "Heaps & Priority Queues",
  subtitle: "Test 07 | Heap Properties",
  topic: "Trees",
  icon: "🏔️",
  questions: [
    {
      q: "A Max-Heap property states that:",
      opts: ["Parent is always smaller than children","Parent is always greater than or equal to its children","All nodes are equal","Leaf nodes are greater than root"],
      ans: 1, tag: "Heap",
      exp: "Max-Heap: Every parent node ≥ its children. The maximum element is always at the root."
    },
    {
      q: "Which data structure is used to implement a Priority Queue efficiently?",
      opts: ["Stack","Queue","Heap","Linked List"],
      ans: 2, tag: "Heap",
      exp: "Heap provides O(log n) insert and O(log n) extract-max/min, making it the most efficient priority queue implementation."
    },
    {
      q: "The time complexity of insertion in a heap is:",
      opts: ["O(1)","O(log n)","O(n)","O(n log n)"],
      ans: 1, tag: "Heap",
      exp: "Insert at end of heap array, then 'bubble up' (heapify up). Maximum number of swaps = height of heap = O(log n)."
    },
    {
      q: "The time complexity of extracting the maximum from a Max-Heap is:",
      opts: ["O(1)","O(log n)","O(n)","O(n log n)"],
      ans: 1, tag: "Heap",
      exp: "Remove root (max), replace with last element, then 'heapify down'. Takes O(log n) for sifting down."
    },
    {
      q: "Heap Sort has time complexity:",
      opts: ["O(n)","O(n log n) always","O(n²)","O(log n)"],
      ans: 1, tag: "Heap",
      exp: "Building heap: O(n). Extracting n elements: O(n log n). Total: O(n log n) in all cases — best, average, worst."
    },
    {
      q: "A heap can be efficiently stored using:",
      opts: ["Linked list","2D array","1D array","Hash table"],
      ans: 2, tag: "Heap",
      exp: "Heap is a complete binary tree. For node at index i: left child = 2i+1, right child = 2i+2, parent = (i-1)/2. Perfect for array storage."
    },
    {
      q: "If a node is at index i in an array representation of heap (0-indexed), its parent is at:",
      opts: ["i/2","(i-1)/2","2i","2i+1"],
      ans: 1, tag: "Heap",
      exp: "Parent of node at index i = floor((i-1)/2). Example: node at index 3: parent = floor(2/2) = 1."
    },
    {
      q: "Which statement is TRUE about heaps?",
      opts: ["Heap is a sorted data structure","In-order traversal gives sorted output","Heap provides O(log n) search","Heap is NOT a sorted structure, but root is min/max"],
      ans: 3, tag: "Heap",
      exp: "Heap is NOT sorted — there's no defined relationship between siblings. Only the heap property (parent ≥ children in max-heap) holds."
    },
    {
      q: "The process of restoring heap property after deletion is called:",
      opts: ["Heapify-up","Heapify-down (Sift-down)","Rotation","Balancing"],
      ans: 1, tag: "Heap",
      exp: "After removing root, last element is placed at root and then heapify-down (sift-down) restores the heap property."
    },
    {
      q: "Building a heap from n unsorted elements takes:",
      opts: ["O(n log n)","O(n)","O(n²)","O(log n)"],
      ans: 1, tag: "Heap",
      exp: "Bottom-up heap construction (Floyd's algorithm) builds heap in O(n) time, which is better than inserting n elements one-by-one O(n log n)."
    },
    {
      q: "In Heap Sort, after building the max-heap, we repeatedly:",
      opts: ["Insert elements","Swap root with last element and heapify","Do in-order traversal","Build min-heap"],
      ans: 1, tag: "Heap",
      exp: "Heap Sort: swap root (max) with last element, reduce heap size by 1, heapify root. Repeat n-1 times to get sorted array."
    },
    {
      q: "Heap Sort is NOT stable because:",
      opts: ["It uses recursion","It is not in-place","Distant elements are swapped, disrupting relative order","It takes O(n²) time"],
      ans: 2, tag: "Heap",
      exp: "In Heap Sort, elements are swapped across the array. Equal elements may change relative order, making it unstable."
    },
    {
      q: "Which of the following is TRUE about Min-Heap?",
      opts: ["Root has the maximum element","Root has the minimum element","Leaf nodes have minimum","It is always sorted"],
      ans: 1, tag: "Heap",
      exp: "Min-Heap: parent ≤ children everywhere. The minimum element is always at the root."
    },
    {
      q: "Dijkstra's shortest path algorithm uses which data structure for efficient implementation?",
      opts: ["Stack","Queue","Min-Heap / Priority Queue","Binary Search Tree"],
      ans: 2, tag: "Heap",
      exp: "Dijkstra uses a min-priority queue (min-heap) to always extract the vertex with minimum distance first."
    },
    {
      q: "The left child of a node at index i (0-indexed array) in a heap is at:",
      opts: ["i+1","2i","2i+1","2i+2"],
      ans: 2, tag: "Heap",
      exp: "Left child = 2i + 1. Right child = 2i + 2. (For 0-indexed arrays)"
    },
    {
      q: "A Fibonacci Heap provides better amortized time for which operation compared to binary heap?",
      opts: ["Extract-Max","Decrease-Key","Insertion","Heapify"],
      ans: 1, tag: "Heap",
      exp: "Fibonacci Heap: Decrease-Key is O(1) amortized (vs O(log n) in binary heap). This improves Dijkstra's to O(E + V log V)."
    },
    {
      q: "Find the parent of the node at index 6 in a 0-indexed max-heap array:",
      opts: ["1","2","3","4"],
      ans: 1, tag: "Heap",
      exp: "Parent = floor((6-1)/2) = floor(5/2) = floor(2.5) = 2."
    },
    {
      q: "Which sorting algorithm uses a heap?",
      opts: ["Merge Sort","Quick Sort","Heap Sort","Counting Sort"],
      ans: 2, tag: "Heap",
      exp: "Heap Sort builds a max-heap and repeatedly extracts the maximum. It is O(n log n) in-place but not stable."
    },
    {
      q: "A d-ary heap (generalization of binary heap) with d children per node has height:",
      opts: ["O(n)","O(log_d n)","O(d log n)","O(n/d)"],
      ans: 1, tag: "Heap",
      exp: "With d children per node, height = O(log_d n) = O(log n / log d). Larger d → shorter height but more work per heapify."
    },
    {
      q: "The operation that finds the minimum in a Min-Heap takes:",
      opts: ["O(n)","O(log n)","O(1)","O(n log n)"],
      ans: 2, tag: "Heap",
      exp: "In a Min-Heap, the minimum is always at the root (index 0). Accessing it is O(1)."
    }
  ]
},

// ==================== TEST 08 ====================
{
  id: 8,
  title: "Graphs - Basics & Representation",
  subtitle: "Test 08 | Graph Concepts",
  topic: "Graphs",
  icon: "🕸️",
  questions: [
    {
      q: "A graph G = (V, E) consists of:",
      opts: ["Only vertices","Only edges","A set of vertices V and edges E","Trees and heaps"],
      ans: 2, tag: "Graph",
      exp: "A graph is defined by a set of vertices (nodes) V and a set of edges E connecting pairs of vertices."
    },
    {
      q: "In an undirected graph with n vertices, the maximum number of edges is:",
      opts: ["n","n-1","n(n-1)/2","n²"],
      ans: 2, tag: "Graph",
      exp: "In undirected graph, maximum edges = C(n,2) = n(n-1)/2. Each pair of vertices can have at most 1 edge."
    },
    {
      q: "In a directed graph (digraph) with n vertices, the maximum number of edges is:",
      opts: ["n(n-1)/2","n(n-1)","n²","n²-n"],
      ans: 1, tag: "Graph",
      exp: "In directed graph, each ordered pair (u,v) can be an edge, and (u,v) ≠ (v,u). Max edges = n(n-1). (No self-loops assumed)"
    },
    {
      q: "Adjacency Matrix for a graph with n vertices requires space:",
      opts: ["O(n)","O(n+E)","O(n²)","O(E)"],
      ans: 2, tag: "Graph",
      exp: "Adjacency matrix is n×n, so space = O(n²) regardless of number of edges."
    },
    {
      q: "Adjacency List representation requires space:",
      opts: ["O(n²)","O(n + E)","O(E²)","O(n × E)"],
      ans: 1, tag: "Graph",
      exp: "Adjacency list: array of n lists, total entries = 2E for undirected (or E for directed). Space = O(n + E)."
    },
    {
      q: "Which representation is preferred for a sparse graph?",
      opts: ["Adjacency Matrix","Adjacency List","Incidence Matrix","Both are equal"],
      ans: 1, tag: "Graph",
      exp: "Sparse graph (few edges): Adjacency list O(n+E) is efficient. Adjacency matrix wastes O(n²) space."
    },
    {
      q: "Which representation is preferred for a dense graph?",
      opts: ["Adjacency List","Adjacency Matrix","Both are equal","Neither"],
      ans: 1, tag: "Graph",
      exp: "Dense graph (many edges, E ≈ n²): Adjacency matrix is efficient for edge existence check O(1). Adjacency list overhead is high."
    },
    {
      q: "A graph where all edges have a direction is called:",
      opts: ["Undirected Graph","Directed Graph (Digraph)","Weighted Graph","Bipartite Graph"],
      ans: 1, tag: "Graph",
      exp: "Directed Graph (Digraph): each edge has a direction from source to destination, represented as ordered pair (u, v)."
    },
    {
      q: "BFS traversal uses which data structure?",
      opts: ["Stack","Queue","Heap","Priority Queue"],
      ans: 1, tag: "Graph",
      exp: "BFS explores neighbors level by level using a Queue (FIFO). DFS uses Stack (LIFO)."
    },
    {
      q: "DFS traversal uses which data structure?",
      opts: ["Queue","Stack (explicit or recursion)","Heap","Array"],
      ans: 1, tag: "Graph",
      exp: "DFS uses a Stack or recursion (which uses call stack) to go as deep as possible before backtracking."
    },
    {
      q: "A connected graph with n vertices and n-1 edges is a:",
      opts: ["Complete graph","Cycle","Tree (Spanning tree)","Bipartite graph"],
      ans: 2, tag: "Graph",
      exp: "A connected graph with exactly n-1 edges and no cycles is a tree. It's the minimum connected structure."
    },
    {
      q: "Which algorithm is used to find the Minimum Spanning Tree?",
      opts: ["DFS","BFS","Kruskal's or Prim's algorithm","Dijkstra's algorithm"],
      ans: 2, tag: "Graph",
      exp: "Kruskal's (edge-based, greedy) and Prim's (vertex-based, greedy) algorithms find the MST of a weighted undirected graph."
    },
    {
      q: "Topological sort is applicable only to:",
      opts: ["Undirected graphs","Cyclic directed graphs","Directed Acyclic Graphs (DAG)","Weighted graphs"],
      ans: 2, tag: "Graph",
      exp: "Topological sort gives a linear ordering of vertices such that for every directed edge (u,v), u comes before v. Only valid for DAGs."
    },
    {
      q: "Which graph algorithm finds shortest paths from a single source with non-negative weights?",
      opts: ["Bellman-Ford","Floyd-Warshall","Dijkstra's","BFS"],
      ans: 2, tag: "Graph",
      exp: "Dijkstra's algorithm finds single-source shortest paths with non-negative edge weights in O((V+E) log V) with a min-heap."
    },
    {
      q: "Bellman-Ford algorithm can handle:",
      opts: ["Only positive weights","Only unweighted graphs","Negative weight edges (no negative cycles)","Only DAGs"],
      ans: 2, tag: "Graph",
      exp: "Bellman-Ford handles negative weight edges and detects negative weight cycles. It runs in O(VE) time."
    },
    {
      q: "In an undirected graph, the sum of degrees of all vertices equals:",
      opts: ["Number of vertices","Number of edges","Twice the number of edges","Half the number of edges"],
      ans: 2, tag: "Graph",
      exp: "Handshaking lemma: Sum of all degrees = 2|E|. Each edge contributes 2 to the total degree sum."
    },
    {
      q: "A graph that can be colored with 2 colors such that no adjacent vertices have same color is called:",
      opts: ["Complete graph","Planar graph","Bipartite graph","Tree"],
      ans: 2, tag: "Graph",
      exp: "Bipartite graph: vertices can be divided into two sets U, V such that every edge connects a vertex in U to one in V."
    },
    {
      q: "Floyd-Warshall algorithm finds:",
      opts: ["Single source shortest path","Minimum spanning tree","All-pairs shortest paths","Topological order"],
      ans: 2, tag: "Graph",
      exp: "Floyd-Warshall computes shortest paths between ALL pairs of vertices in O(V³) time using dynamic programming."
    },
    {
      q: "What is the time complexity of BFS traversal on a graph with V vertices and E edges?",
      opts: ["O(V)","O(E)","O(V + E)","O(V × E)"],
      ans: 2, tag: "Graph",
      exp: "BFS visits each vertex once O(V) and processes each edge once O(E). Total = O(V + E)."
    },
    {
      q: "An Euler circuit in a graph exists if and only if:",
      opts: ["Graph is connected","All vertices have even degree","Graph is connected AND all vertices have even degree","No vertex has degree > 2"],
      ans: 2, tag: "Graph",
      exp: "Euler circuit (visits every edge exactly once, returns to start): graph must be connected AND every vertex must have even degree."
    }
  ]
},

// ==================== TEST 09 ====================
{
  id: 9,
  title: "Sorting Algorithms",
  subtitle: "Test 09 | Comparison-based Sorting",
  topic: "Sorting",
  icon: "🔢",
  questions: [
    {
      q: "What is the best-case time complexity of Quick Sort?",
      opts: ["O(n)","O(n log n)","O(n²)","O(log n)"],
      ans: 1, tag: "Sorting",
      exp: "Quick Sort best case: pivot always divides array equally → T(n) = 2T(n/2) + O(n) → O(n log n)."
    },
    {
      q: "What is the worst-case time complexity of Quick Sort?",
      opts: ["O(n log n)","O(n)","O(n²)","O(n³)"],
      ans: 2, tag: "Sorting",
      exp: "Worst case: pivot is always smallest or largest (sorted/reverse sorted input) → T(n) = T(n-1) + O(n) → O(n²)."
    },
    {
      q: "Merge Sort's time complexity in all cases (best, average, worst) is:",
      opts: ["O(n)","O(n log n)","O(n²)","O(log n)"],
      ans: 1, tag: "Sorting",
      exp: "Merge Sort always divides array in half and merges: T(n) = 2T(n/2) + O(n) → O(n log n) in all cases."
    },
    {
      q: "Which sorting algorithm is NOT in-place (requires extra O(n) space)?",
      opts: ["Bubble Sort","Quick Sort","Selection Sort","Merge Sort"],
      ans: 3, tag: "Sorting",
      exp: "Merge Sort requires O(n) auxiliary space for the merging step. Others are in-place (O(1) or O(log n) for recursion stack)."
    },
    {
      q: "Which of the following is a Divide and Conquer sorting algorithm?",
      opts: ["Bubble Sort","Insertion Sort","Merge Sort","Selection Sort"],
      ans: 2, tag: "Sorting",
      exp: "Merge Sort divides array into halves, recursively sorts, then merges — classic divide and conquer."
    },
    {
      q: "What is the time complexity of Counting Sort?",
      opts: ["O(n log n)","O(n + k) where k is the range","O(n²)","O(n)"],
      ans: 1, tag: "Sorting",
      exp: "Counting Sort: O(n + k) where n = number of elements, k = range of input values. Not comparison-based."
    },
    {
      q: "Which sorting algorithm has the BEST best-case performance?",
      opts: ["Bubble Sort","Quick Sort","Insertion Sort","Merge Sort"],
      ans: 2, tag: "Sorting",
      exp: "Insertion Sort has O(n) best case (nearly sorted input — few inversions). Bubble Sort with optimization is also O(n) best case."
    },
    {
      q: "The number of swaps in Selection Sort is:",
      opts: ["O(n²)","O(n log n)","O(n) — exactly n-1 swaps","O(1)"],
      ans: 2, tag: "Sorting",
      exp: "Selection Sort makes exactly n-1 swaps (one per pass, even if already in place). This makes it good when swaps are expensive."
    },
    {
      q: "Quick Sort is generally preferred over Merge Sort because:",
      opts: ["It's always O(n log n)","It's stable","Better cache performance and in-place","It uses less comparisons"],
      ans: 2, tag: "Sorting",
      exp: "Quick Sort has better cache performance (in-place, sequential access) and O(1) extra space vs O(n) for Merge Sort."
    },
    {
      q: "Radix Sort processes digits:",
      opts: ["From most significant to least significant only","From least significant to most significant (LSD)","In random order","By value, not position"],
      ans: 1, tag: "Sorting",
      exp: "LSD Radix Sort processes digits from least significant to most significant. It requires a stable sort at each digit position."
    },
    {
      q: "Which of these is NOT a comparison-based sorting algorithm?",
      opts: ["Merge Sort","Quick Sort","Counting Sort","Heap Sort"],
      ans: 2, tag: "Sorting",
      exp: "Counting Sort does not compare elements — it counts occurrences. The lower bound O(n log n) does NOT apply to it."
    },
    {
      q: "The lower bound for comparison-based sorting algorithms is:",
      opts: ["O(n)","O(n log n)","O(n²)","O(log n)"],
      ans: 1, tag: "Sorting",
      exp: "Any comparison-based sorting algorithm requires Ω(n log n) comparisons in the worst case. This is proven via decision trees."
    },
    {
      q: "In bubble sort, if no swaps occur in a pass, it means:",
      opts: ["Array is completely unsorted","Array is sorted — algorithm can stop","Array has duplicate elements","Array has negative numbers"],
      ans: 1, tag: "Sorting",
      exp: "If a complete pass has no swaps, the array is already sorted. Optimized bubble sort terminates early in this case."
    },
    {
      q: "Shell Sort is an improvement over:",
      opts: ["Merge Sort","Quick Sort","Insertion Sort","Selection Sort"],
      ans: 2, tag: "Sorting",
      exp: "Shell Sort extends insertion sort by comparing and sorting elements far apart first (using gap sequences), then reducing the gap."
    },
    {
      q: "Which algorithm sorts by finding the minimum element and placing it at the correct position in each pass?",
      opts: ["Bubble Sort","Insertion Sort","Selection Sort","Quick Sort"],
      ans: 2, tag: "Sorting",
      exp: "Selection Sort: in each pass, find minimum from unsorted portion and swap it to the beginning of unsorted portion."
    },
    {
      q: "The space complexity of Merge Sort is:",
      opts: ["O(1)","O(log n)","O(n)","O(n log n)"],
      ans: 2, tag: "Sorting",
      exp: "Merge Sort requires O(n) auxiliary space for the temporary array used during merging."
    },
    {
      q: "Which sorting is used internally by most programming language libraries (Python's sort, Java's Arrays.sort)?",
      opts: ["Quick Sort","Merge Sort","Tim Sort (hybrid Merge+Insertion)","Heap Sort"],
      ans: 2, tag: "Sorting",
      exp: "Tim Sort (developed by Tim Peters) is a hybrid of Merge Sort and Insertion Sort. Used in Python, Java, and many modern languages."
    },
    {
      q: "For sorting n records when n is very large and records are on disk, which sort is preferred?",
      opts: ["Quick Sort","Bubble Sort","External Merge Sort","Heap Sort"],
      ans: 2, tag: "Sorting",
      exp: "External Merge Sort is designed for data too large to fit in RAM. It minimizes disk I/O by merging sorted runs."
    },
    {
      q: "What is the average case time complexity of Quick Sort?",
      opts: ["O(n²)","O(n)","O(n log n)","O(n³)"],
      ans: 2, tag: "Sorting",
      exp: "Average case of Quick Sort is O(n log n) with a good pivot selection (e.g., random pivot)."
    },
    {
      q: "Insertion sort inserts the i-th element into its correct position among the first:",
      opts: ["n-i elements","i-1 already sorted elements","All n elements","Only 2 elements"],
      ans: 1, tag: "Sorting",
      exp: "Insertion Sort maintains a sorted sub-array. The i-th element is inserted into its correct position in the first i-1 sorted elements."
    }
  ]
},

// ==================== TEST 10 ====================
{
  id: 10,
  title: "Hashing & Hash Tables",
  subtitle: "Test 10 | Hash Functions",
  topic: "Hashing",
  icon: "#️⃣",
  questions: [
    {
      q: "What is hashing?",
      opts: ["Sorting elements","Mapping keys to array indices using a hash function","Linked list operations","Tree traversal"],
      ans: 1, tag: "Hashing",
      exp: "Hashing maps a key to an index (bucket) in a hash table using a hash function h(key) = index."
    },
    {
      q: "The average case time complexity of search in a hash table is:",
      opts: ["O(n)","O(log n)","O(1)","O(n²)"],
      ans: 2, tag: "Hashing",
      exp: "With a good hash function and low load factor, hash table search is O(1) average case."
    },
    {
      q: "A 'collision' in hashing occurs when:",
      opts: ["Table is full","Two different keys hash to the same index","Table is empty","Hash function is undefined"],
      ans: 1, tag: "Hashing",
      exp: "Collision: two distinct keys k1 ≠ k2 such that h(k1) == h(k2). Collision resolution is required."
    },
    {
      q: "Which method resolves collision using a linked list at each hash table slot?",
      opts: ["Linear Probing","Quadratic Probing","Separate Chaining","Double Hashing"],
      ans: 2, tag: "Hashing",
      exp: "Separate Chaining: each slot has a linked list. All keys with same hash value are stored in the same list."
    },
    {
      q: "In linear probing, if collision occurs at index i, the next probe is at:",
      opts: ["i + random","(i + 1) % n","(i + i²) % n","Another hash function applied"],
      ans: 1, tag: "Hashing",
      exp: "Linear Probing: check consecutive slots (i+1), (i+2), ... (with wrap-around) until empty slot is found."
    },
    {
      q: "A problem with linear probing is:",
      opts: ["Too much memory use","Primary clustering — long sequences of filled slots","Cannot handle any collisions","Requires sorted input"],
      ans: 1, tag: "Hashing",
      exp: "Primary clustering: consecutive filled slots make future insertions form even longer chains, degrading performance."
    },
    {
      q: "Quadratic probing uses the sequence:",
      opts: ["i, i+1, i+2, ...","i, i+1², i+2², ...","i, i+k, i+2k, ...","i, h₂(k), 2h₂(k), ..."],
      ans: 1, tag: "Hashing",
      exp: "Quadratic Probing: probe positions are (i + 1²), (i + 2²), (i + 3²), ... Reduces primary clustering but causes secondary clustering."
    },
    {
      q: "Load factor α of a hash table is defined as:",
      opts: ["Number of elements / Table size","Table size / Number of elements","Number of collisions","Number of empty slots"],
      ans: 0, tag: "Hashing",
      exp: "Load factor α = n/m where n = number of inserted elements, m = table size. Low α reduces collisions."
    },
    {
      q: "The best hash function distributes keys:",
      opts: ["To first slots only","Uniformly across all table slots","Alphabetically","By insertion order"],
      ans: 1, tag: "Hashing",
      exp: "A good hash function achieves uniform distribution — minimizing collisions by spreading keys evenly."
    },
    {
      q: "Double Hashing uses a second hash function h₂(k) to:",
      opts: ["Build a backup table","Determine the probe step size","Split the table","Compute primary hash"],
      ans: 1, tag: "Hashing",
      exp: "Double Hashing: probe sequence = (h₁(k) + i × h₂(k)) % m. Different step sizes per key reduce clustering."
    },
    {
      q: "Worst case time complexity of search in a hash table (with chaining) is:",
      opts: ["O(1)","O(log n)","O(n)","O(n²)"],
      ans: 2, tag: "Hashing",
      exp: "Worst case: all n elements hash to same slot — one chain of length n. Search = O(n). This is unlikely with good hash functions."
    },
    {
      q: "A hash function h(k) = k mod m. If m = 10 and k = 37, what is h(k)?",
      opts: ["3","7","4","10"],
      ans: 1, tag: "Hashing",
      exp: "h(37) = 37 mod 10 = 7."
    },
    {
      q: "Which collision resolution requires that the load factor must be < 1 (table cannot be full)?",
      opts: ["Separate Chaining","Open Addressing (Linear/Quadratic/Double Hashing)","Both","Neither"],
      ans: 1, tag: "Hashing",
      exp: "Open addressing stores all elements in the table itself. If load factor = 1 (full), no new insertions are possible."
    },
    {
      q: "Rehashing is done when:",
      opts: ["Table is empty","Load factor exceeds a threshold","Collision occurs","Keys are deleted"],
      ans: 1, tag: "Hashing",
      exp: "Rehashing creates a larger table and reinserts all elements when load factor becomes too high (e.g., > 0.7)."
    },
    {
      q: "Which data structure uses hashing for O(1) average case operations?",
      opts: ["Array","Linked List","Hash Table / Dictionary","BST"],
      ans: 2, tag: "Hashing",
      exp: "Hash Table (Dictionary/HashMap) uses hashing for O(1) average insert, delete, and search."
    },
    {
      q: "The Division method hash function is h(k) = k mod m. What is a good choice for m?",
      opts: ["Power of 2","Even number","A prime number not close to a power of 2","Any odd number"],
      ans: 2, tag: "Hashing",
      exp: "m should be a prime number not close to a power of 2. This ensures uniform distribution of remainders."
    },
    {
      q: "Which application extensively uses Hash Tables?",
      opts: ["Recursion","Database indexing and symbol tables in compilers","Topological sorting","Shortest path algorithms"],
      ans: 1, tag: "Hashing",
      exp: "Compilers use hash tables for symbol tables. Databases use them for fast lookup. Python dictionaries, Java HashMaps are hash tables."
    },
    {
      q: "Secondary clustering is a problem in:",
      opts: ["Separate Chaining","Linear Probing","Quadratic Probing","Double Hashing"],
      ans: 2, tag: "Hashing",
      exp: "Quadratic Probing: keys with same initial hash follow the same probe sequence — secondary clustering. Double hashing solves this."
    },
    {
      q: "If hash table has m slots and n elements, with separate chaining, expected search time is:",
      opts: ["O(n/m) = O(α)","O(m)","O(n)","O(1) always"],
      ans: 0, tag: "Hashing",
      exp: "Expected search time with chaining = O(1 + α) where α = n/m (load factor). Low α → near O(1) performance."
    },
    {
      q: "Which statement about hash tables is FALSE?",
      opts: ["Average case O(1) for insert","Cannot be used for range queries efficiently","Always O(1) worst case","Open addressing doesn't use extra memory for pointers"],
      ans: 2, tag: "Hashing",
      exp: "Hash tables do NOT guarantee O(1) worst case. Worst case is O(n) due to all elements colliding. BSTs guarantee O(log n) worst case."
    }
  ]
},

// ==================== TESTS 11-20: Additional topics ====================
{
  id: 11,
  title: "Graphs - BFS, DFS & MST",
  subtitle: "Test 11 | Graph Algorithms",
  topic: "Graphs",
  icon: "🗺️",
  questions: [
    {q:"BFS starting from vertex A visits vertices in which order for a graph: A-B, A-C, B-D, C-E?",opts:["A,B,C,D,E","A,B,D,C,E","A,C,E,B,D","A,D,B,E,C"],ans:0,tag:"BFS",exp:"BFS explores level by level. Level 0: A. Level 1: B,C. Level 2: D,E. Order: A,B,C,D,E."},
    {q:"DFS from vertex A for graph: A-B, A-C, B-D visits in order:",opts:["A,B,C,D","A,B,D,C","A,C,B,D","A,D,B,C"],ans:1,tag:"DFS",exp:"DFS goes deep first: A → B (go deep) → D (leaf, backtrack) → C. Order: A,B,D,C."},
    {q:"Prim's algorithm builds MST by starting with:",opts:["An arbitrary edge","An arbitrary vertex and growing the tree","All vertices","Sorting all edges"],ans:1,tag:"MST",exp:"Prim's starts with one vertex and greedily adds the minimum weight edge connecting the tree to a non-tree vertex."},
    {q:"Kruskal's algorithm builds MST by:",opts:["Starting with min vertex","Sorting all edges by weight and adding edges that don't form cycles","DFS traversal","BFS traversal"],ans:1,tag:"MST",exp:"Kruskal's sorts edges by weight and greedily adds the cheapest edge that doesn't create a cycle (using Union-Find)."},
    {q:"The time complexity of Kruskal's algorithm is:",opts:["O(V²)","O(E log E)","O(VE)","O(V log V)"],ans:1,tag:"MST",exp:"Kruskal's: sort edges O(E log E) + Union-Find operations O(E α(V)) ≈ O(E log E)."},
    {q:"The time complexity of Prim's algorithm with binary heap is:",opts:["O(V²)","O(E log V)","O(V log V)","O(E²)"],ans:1,tag:"MST",exp:"Prim's with priority queue: O((V + E) log V) ≈ O(E log V) for connected graphs."},
    {q:"Which data structure does Kruskal's algorithm use for cycle detection?",opts:["Stack","Queue","Union-Find (Disjoint Set Union)","BST"],ans:2,tag:"MST",exp:"Kruskal's uses Union-Find (Disjoint Set) to check if adding an edge creates a cycle in O(α(n)) ≈ O(1) amortized."},
    {q:"Topological Sort of a DAG can be done using:",opts:["BFS only","DFS only","Either DFS or BFS (Kahn's algorithm)","Prim's algorithm"],ans:2,tag:"Graph",exp:"Topological Sort via DFS (finish-time ordering) or BFS (Kahn's algorithm using in-degree array). Both valid."},
    {q:"In BFS, the shortest path from source to all vertices (unweighted graph) is found in:",opts:["O(V²)","O(V + E)","O(E log V)","O(V log V)"],ans:1,tag:"BFS",exp:"BFS explores level by level, finding shortest paths (in terms of edges) in O(V + E) time."},
    {q:"A graph with no cycles is called:",opts:["Dense graph","Complete graph","Acyclic graph (Forest or Tree)","Bipartite graph"],ans:2,tag:"Graph",exp:"An undirected acyclic graph is a forest (collection of trees). A directed acyclic graph is a DAG."},
    {q:"Strongly Connected Components (SCC) are found using:",opts:["BFS","Kruskal's","Kosaraju's or Tarjan's algorithm","Prim's"],ans:2,tag:"Graph",exp:"SCCs in a directed graph are found using Kosaraju's algorithm (2 DFS passes) or Tarjan's algorithm (1 DFS pass)."},
    {q:"In an undirected graph, DFS can be used to find:",opts:["Shortest path","Minimum spanning tree","Articulation points (bridges)","All-pairs shortest path"],ans:2,tag:"DFS",exp:"DFS-based algorithms find articulation points (vertices whose removal disconnects the graph) and bridges (critical edges)."},
    {q:"Dijkstra's algorithm fails when:",opts:["Graph is sparse","Graph has negative weight edges","Graph is directed","Graph has many vertices"],ans:1,tag:"Graph",exp:"Dijkstra assumes non-negative edge weights. Negative edges cause it to give incorrect results. Use Bellman-Ford instead."},
    {q:"A complete graph K₅ has how many edges?",opts:["5","10","20","25"],ans:1,tag:"Graph",exp:"Complete graph Kₙ: n(n-1)/2 edges. K₅: 5×4/2 = 10 edges."},
    {q:"Which algorithm solves All-Pairs Shortest Path in O(V³)?",opts:["Dijkstra","BFS","Bellman-Ford","Floyd-Warshall"],ans:3,tag:"Graph",exp:"Floyd-Warshall: O(V³) DP algorithm for all-pairs shortest paths. Handles negative weights (but not negative cycles)."},
    {q:"The number of edges in a Minimum Spanning Tree of a connected graph with V vertices is:",opts:["V","V-1","V+1","E"],ans:1,tag:"MST",exp:"MST has exactly V-1 edges (minimum edges to connect V vertices without cycles)."},
    {q:"Which property of Union-Find makes it nearly O(1) per operation?",opts:["Path Compression + Union by Rank","Just path compression","Just union by rank","Hashing"],ans:0,tag:"Graph",exp:"Path Compression + Union by Rank together give amortized O(α(n)) ≈ O(1) per operation."},
    {q:"In a directed graph, if vertex v is reachable from u and u from v, they are:",opts:["Adjacent","In the same SCC","Not connected","In different SCCs"],ans:1,tag:"Graph",exp:"If u can reach v AND v can reach u in a directed graph, they belong to the same Strongly Connected Component."},
    {q:"BFS on an unweighted graph finds shortest paths because:",opts:["It's recursive","It explores all vertices at distance k before k+1","It uses a priority queue","It backtracks"],ans:1,tag:"BFS",exp:"BFS FIFO property ensures all vertices at distance d are explored before any vertex at distance d+1. Hence finds shortest path."},
    {q:"Euler path exists in an undirected graph if:",opts:["All vertices have even degree","Exactly 2 vertices have odd degree and rest have even degree","All vertices have degree 2","Graph is complete"],ans:1,tag:"Graph",exp:"Euler path (visits every edge once): either 0 or exactly 2 vertices have odd degree. If 0 odd-degree vertices, Euler circuit exists."}
  ]
},

{
  id: 12,
  title: "Recursion & Backtracking",
  subtitle: "Test 12 | Recursive Algorithms",
  topic: "Algorithms",
  icon: "🔄",
  questions: [
    {q:"What is the base case in recursion?",opts:["The recursive call","The condition that stops further recursion","The largest input","The first call"],ans:1,tag:"Recursion",exp:"Base case: condition under which the function returns directly without further recursive calls, preventing infinite recursion."},
    {q:"The time complexity of computing nth Fibonacci number using simple recursion is:",opts:["O(n)","O(n log n)","O(2ⁿ)","O(n²)"],ans:2,tag:"Recursion",exp:"Simple recursive Fibonacci re-computes subproblems. The call tree has ~2ⁿ nodes → exponential O(2ⁿ)."},
    {q:"Memoization in recursion means:",opts:["Using loops instead","Storing results of subproblems to avoid recomputation","Sorting before recursing","Using a stack explicitly"],ans:1,tag:"Recursion",exp:"Memoization stores previously computed results in a cache. Fibonacci with memoization runs in O(n) instead of O(2ⁿ)."},
    {q:"The Tower of Hanoi with n discs requires minimum how many moves?",opts:["n","n²","2ⁿ-1","n log n"],ans:2,tag:"Recursion",exp:"T(n) = 2T(n-1) + 1 solves to T(n) = 2ⁿ - 1. E.g., 3 discs = 7 moves."},
    {q:"What is tail recursion?",opts:["Recursion without base case","The recursive call is the LAST operation in the function","Recursion using loop","Recursion with multiple base cases"],ans:1,tag:"Recursion",exp:"Tail recursion: the recursive call is the very last statement. Can be optimized by compilers to use O(1) stack space."},
    {q:"Which of these is NOT solved by backtracking?",opts:["N-Queens problem","Sudoku","Shortest path in weighted graph","Maze solving"],ans:2,tag:"Backtracking",exp:"Shortest path in weighted graph uses Dijkstra/Bellman-Ford (greedy/DP). N-Queens, Sudoku, maze use backtracking."},
    {q:"The N-Queens problem places N queens on N×N board such that:",opts:["All queens attack each other","No two queens attack each other","All queens are in same row","Queens are placed diagonally"],ans:1,tag:"Backtracking",exp:"N-Queens: place N queens so no two share the same row, column, or diagonal (no attacks)."},
    {q:"Backtracking is essentially:",opts:["BFS with pruning","DFS with pruning (abandoning invalid paths early)","Greedy algorithm","Dynamic programming"],ans:1,tag:"Backtracking",exp:"Backtracking = DFS + pruning. When a partial solution violates constraints, backtrack (undo) and try another path."},
    {q:"The recursion stack space used by a DFS on a tree of height h is:",opts:["O(n)","O(h)","O(1)","O(n²)"],ans:1,tag:"Recursion",exp:"DFS recursion depth = height of tree = h. Each active call occupies one stack frame → O(h) space."},
    {q:"Which problem is a classic example of backtracking?",opts:["Merge sort","Knapsack (greedy)","0/1 Knapsack (exhaustive)","BFS traversal"],ans:2,tag:"Backtracking",exp:"0/1 Knapsack uses backtracking (or DP). We try including/excluding each item and backtrack if weight exceeds capacity."},
    {q:"The recurrence T(n) = T(n-1) + O(1) has solution:",opts:["O(log n)","O(n)","O(n²)","O(2ⁿ)"],ans:1,tag:"Recursion",exp:"T(n) = T(n-1) + c. Expanding: T(n) = nc → O(n). Example: factorial."},
    {q:"The recurrence T(n) = 2T(n/2) + O(n) has solution (Master Theorem):",opts:["O(n)","O(n log n)","O(n²)","O(2ⁿ)"],ans:1,tag:"Recursion",exp:"By Master Theorem case 2: a=2, b=2, f(n)=n, log_b(a)=1. Since f(n) = Θ(n^log_b(a)), T(n) = O(n log n). (Merge Sort)"},
    {q:"Which algorithmic technique can convert most recursive solutions to iterative using explicit stack?",opts:["Greedy","Dynamic Programming","Stack-based iteration","Hashing"],ans:2,tag:"Recursion",exp:"Any recursion that uses a call stack can be converted to iterative by managing an explicit stack data structure."},
    {q:"Mutual recursion means:",opts:["A function calls itself directly","Function A calls B, and B calls A (indirectly recursive)","Two identical recursive functions","Recursion with two base cases"],ans:1,tag:"Recursion",exp:"Mutual (indirect) recursion: f() calls g() which calls f(). Neither calls itself directly."},
    {q:"Graph coloring (assigning k colors with no adjacent same color) is solved by:",opts:["Greedy only","Backtracking","BFS","Topological sort"],ans:1,tag:"Backtracking",exp:"Graph coloring uses backtracking — try coloring each vertex, backtrack if conflict. Greedy doesn't guarantee optimal."},
    {q:"Which of the following characterizes the 'subset sum' problem?",opts:["Find minimum element","Find if subset exists with sum equal to target S — solved by backtracking/DP","Find maximum spanning tree","Sort the array"],ans:1,tag:"Backtracking",exp:"Subset Sum: given set of integers, find subset with sum = S. Solved by backtracking or dynamic programming."},
    {q:"What is the time complexity of a recursive binary search?",opts:["O(n)","O(log n)","O(n log n)","O(1)"],ans:1,tag:"Recursion",exp:"Binary search: T(n) = T(n/2) + O(1) → O(log n). Each call halves the search space."},
    {q:"In recursion, 'stack overflow' occurs when:",opts:["Array is too small","Recursive calls go too deep (no base case / too large input)","Hash collision","Sorting fails"],ans:1,tag:"Recursion",exp:"Stack overflow in recursion: too many nested calls exceed the call stack memory limit. Often due to missing/wrong base case."},
    {q:"The Hamiltonian Path problem (finding a path visiting every vertex exactly once) is solved by:",opts:["Dijkstra's","Greedy approach","Backtracking","BFS"],ans:2,tag:"Backtracking",exp:"Hamiltonian Path is NP-complete. Practical solutions use backtracking with pruning to explore all possible paths."},
    {q:"Which of these recurrences represents Quick Sort average case?",opts:["T(n) = T(n-1) + O(n)","T(n) = 2T(n/2) + O(n)","T(n) = T(n/4) + O(n)","T(n) = T(n-2) + O(1)"],ans:1,tag:"Recursion",exp:"Average case: pivot divides into ~n/2 halves: T(n) = 2T(n/2) + O(n) → O(n log n). Same as Merge Sort recurrence."}
  ]
},

{
  id: 13,
  title: "Dynamic Programming",
  subtitle: "Test 13 | DP Concepts",
  topic: "Algorithms",
  icon: "💡",
  questions: [
    {q:"Dynamic Programming is best applied when a problem has:",opts:["No subproblems","Overlapping subproblems + Optimal substructure","Non-overlapping subproblems","Only greedy choices"],ans:1,tag:"DP",exp:"DP is effective when: (1) Overlapping subproblems — same subproblems solved multiple times. (2) Optimal substructure — optimal solution built from optimal subsolutions."},
    {q:"The two approaches of Dynamic Programming are:",opts:["Top-Down only","Bottom-Up only","Top-Down (Memoization) and Bottom-Up (Tabulation)","Recursion and Iteration"],ans:2,tag:"DP",exp:"Top-Down DP uses recursion + memoization. Bottom-Up fills a table iteratively from smallest subproblems."},
    {q:"The time complexity of Fibonacci using DP (memoization) is:",opts:["O(2ⁿ)","O(n²)","O(n)","O(log n)"],ans:2,tag:"DP",exp:"Memoized Fibonacci: each of the n values is computed exactly once → O(n) time, O(n) space."},
    {q:"The 0/1 Knapsack Problem using DP has time complexity:",opts:["O(n)","O(nW) where W is capacity","O(n²)","O(2ⁿ)"],ans:1,tag:"DP",exp:"0/1 Knapsack DP table is n×W. Filling takes O(nW) time and O(nW) space."},
    {q:"Longest Common Subsequence (LCS) of two strings of length m and n has DP complexity:",opts:["O(m+n)","O(mn)","O(m²n²)","O(2^(m+n))"],ans:1,tag:"DP",exp:"LCS DP fills an (m+1)×(n+1) table. Each cell takes O(1) → Total O(mn)."},
    {q:"Shortest path in a DAG using DP is computed in which order?",opts:["Reverse topological order","Topological order","BFS order","Sorted by weight"],ans:1,tag:"DP",exp:"Process vertices in topological order. For each vertex, relax all outgoing edges. O(V + E) time."},
    {q:"Matrix Chain Multiplication using DP computes:",opts:["Product of matrices","Optimal parenthesization to minimize scalar multiplications","Matrix inverse","Determinant"],ans:1,tag:"DP",exp:"MCM finds the order to parenthesize matrix products to minimize total scalar multiplications. O(n³) DP solution."},
    {q:"Floyd-Warshall algorithm for all-pairs shortest paths is an example of:",opts:["Greedy algorithm","Backtracking","Dynamic Programming","Divide and Conquer"],ans:2,tag:"DP",exp:"Floyd-Warshall uses DP: D[i][j][k] = shortest path from i to j using vertices {1,...,k}. O(V³) time."},
    {q:"Greedy algorithms differ from DP in that greedy:",opts:["Uses more memory","Considers all future choices","Makes locally optimal choice without reconsidering","Uses tabulation"],ans:2,tag:"DP",exp:"Greedy: commit to local optimum at each step without reconsidering. DP: considers all possibilities. Greedy may fail for some problems."},
    {q:"Bellman-Ford algorithm for shortest paths is an example of:",opts:["Pure greedy","Dynamic Programming","Backtracking","BFS"],ans:1,tag:"DP",exp:"Bellman-Ford relaxes all edges V-1 times. This is a DP approach — building solution incrementally."},
    {q:"Edit distance (minimum operations to convert one string to another) uses:",opts:["Greedy","BFS","DP (Levenshtein algorithm)","Hashing"],ans:2,tag:"DP",exp:"Edit Distance DP: dp[i][j] = min edits to convert string1[1..i] to string2[1..j]. O(mn) time."},
    {q:"The coin change problem (minimum coins for amount S) is solved optimally by:",opts:["Greedy always","DP always","BFS","Backtracking"],ans:1,tag:"DP",exp:"Greedy fails for some coin denominations (e.g., coins [1,3,4], amount=6). DP always finds optimal solution."},
    {q:"The key difference between memoization and tabulation is:",opts:["Speed","Memoization is top-down recursive; tabulation is bottom-up iterative","Memory usage only","They are identical"],ans:1,tag:"DP",exp:"Memoization: recursive + cache (top-down). Tabulation: iterative, fills table from base cases up (bottom-up)."},
    {q:"Longest Increasing Subsequence (LIS) has an O(n²) DP solution and an optimized:",opts:["O(n) solution","O(n log n) solution using patience sorting","O(n³) solution","No better solution"],ans:1,tag:"DP",exp:"LIS can be solved in O(n log n) using binary search + patience sorting / BIT (Binary Indexed Tree)."},
    {q:"Which problem CANNOT be solved optimally with a greedy approach?",opts:["Activity Selection","Fractional Knapsack","0/1 Knapsack","Huffman Coding"],ans:2,tag:"DP",exp:"0/1 Knapsack requires DP. Fractional Knapsack can be solved greedily (take fractions). 0/1 doesn't allow fractions."},
    {q:"DP optimizes recursion by avoiding recomputation. This is called:",opts:["Pruning","Memoization / Caching","Sorting","Hashing"],ans:1,tag:"DP",exp:"Memoization stores results of expensive function calls and returns cached result when same inputs occur again."},
    {q:"The Rod Cutting problem (maximize revenue from cutting rod into pieces) uses:",opts:["Greedy","DP","Backtracking","BFS"],ans:1,tag:"DP",exp:"Rod Cutting: optimal substructure + overlapping subproblems → DP. T(n) = max(p[i] + T(n-i)) for all i."},
    {q:"Subset Sum problem (decide if subset with target sum exists) has DP complexity:",opts:["O(n)","O(nS) where S is target sum","O(2ⁿ)","O(n log n)"],ans:1,tag:"DP",exp:"Subset Sum DP table is n×S. O(nS) time and space. Pseudo-polynomial since it depends on value S."},
    {q:"In bottom-up DP, the order of computation is:",opts:["Largest subproblem first","Arbitrary","Smallest subproblems first (build up to full problem)","Recursive calls only"],ans:2,tag:"DP",exp:"Bottom-up DP fills the table starting from base cases (smallest subproblems) and uses them to compute larger subproblems."},
    {q:"Longest Palindromic Subsequence of string 'BBABCBCAB' uses which technique?",opts:["Greedy","Stack","LCS of string with its reverse using DP","Binary Search"],ans:2,tag:"DP",exp:"LPS of string S = LCS(S, reverse(S)). Computed using 2D DP table in O(n²)."}
  ]
},

{
  id: 14,
  title: "Searching Algorithms",
  subtitle: "Test 14 | Search Techniques",
  topic: "Searching",
  icon: "🔍",
  questions: [
    {q:"Binary search requires the array to be:",opts:["Unsorted","Sorted","Circular","Random"],ans:1,tag:"Search",exp:"Binary search only works on SORTED arrays. It compares the target with the middle element and eliminates half the search space."},
    {q:"The time complexity of binary search is:",opts:["O(n)","O(n²)","O(log n)","O(n log n)"],ans:2,tag:"Search",exp:"Binary search: each step halves the search space. After k steps, n/2^k = 1 → k = log₂n. Complexity = O(log n)."},
    {q:"Interpolation search works best when:",opts:["Data is sorted and uniformly distributed","Data is completely random","Data is in reverse order","Data has duplicates"],ans:0,tag:"Search",exp:"Interpolation search estimates position using interpolation formula. Works best for uniformly distributed sorted data → O(log log n)."},
    {q:"In exponential search, we first find the range [2^k, 2^(k+1)] containing the target, then:",opts:["Do linear search in range","Do binary search in that range","Do hashing","Sort the range"],ans:1,tag:"Search",exp:"Exponential Search: find range by doubling (1,2,4,8,...) → O(log n), then binary search in range → O(log n). Total O(log n)."},
    {q:"Linear search has time complexity:",opts:["O(log n)","O(n)","O(1)","O(n log n)"],ans:1,tag:"Search",exp:"Linear search checks each element sequentially. Worst case: element at end or not present → O(n)."},
    {q:"Which search is used in phone books (sorted alphabetically)?",opts:["Linear Search","Binary Search","Hash Search","Graph Search"],ans:1,tag:"Search",exp:"Phone books are sorted. Binary search (or interpolation search) quickly finds names — O(log n) vs O(n) for linear."},
    {q:"Fibonacci Search is an improvement over binary search that uses:",opts:["Hash functions","Fibonacci numbers to divide the array","Recursive tree","Random sampling"],ans:1,tag:"Search",exp:"Fibonacci Search divides the array using Fibonacci numbers instead of halving. Useful when array access is expensive."},
    {q:"Jump Search on a sorted array of n elements with block size √n has complexity:",opts:["O(n)","O(√n)","O(log n)","O(n²)"],ans:1,tag:"Search",exp:"Jump Search: jump √n steps ahead, then linear search back. Total comparisons ≈ √n → O(√n)."},
    {q:"Ternary Search divides the array into:",opts:["2 parts","3 parts","4 parts","log n parts"],ans:1,tag:"Search",exp:"Ternary Search: divides array into 3 parts using 2 midpoints, eliminating 1/3 of search space each time → O(log₃n)."},
    {q:"Which search technique doesn't require the array to be sorted?",opts:["Binary Search","Interpolation Search","Linear Search","Fibonacci Search"],ans:2,tag:"Search",exp:"Linear Search works on unsorted arrays. All other listed searches require sorted arrays."},
    {q:"The average case comparisons in successful linear search (each position equally likely) is:",opts:["n","n/2","1","log n"],ans:1,tag:"Search",exp:"On average, the element is found after checking n/2 elements. Average comparisons = (n+1)/2 ≈ n/2 = O(n)."},
    {q:"Binary search on linked list is NOT preferred because:",opts:["Linked list is unsorted","Linked list doesn't have random access (O(n) to reach middle)","Binary search needs hash table","Linked list can't store sorted data"],ans:1,tag:"Search",exp:"Binary search needs O(1) access to middle element. Linked list requires O(n) traversal to reach middle, negating benefit."},
    {q:"Hashing provides ___ average case for search:",opts:["O(n)","O(log n)","O(1)","O(n log n)"],ans:2,tag:"Search",exp:"Hash table search is O(1) average case with a good hash function and low load factor."},
    {q:"In binary search, when should we return -1 (not found)?",opts:["When left > right","When array is empty","When middle element is target","When left == right"],ans:0,tag:"Search",exp:"When left > right, the search space is exhausted. The element is not present — return -1 or 'not found'."},
    {q:"Which search works on BOTH sorted and unsorted data?",opts:["Binary Search","Linear Search","Interpolation Search","Jump Search"],ans:1,tag:"Search",exp:"Linear Search makes no assumptions about data ordering. It's the only general-purpose search in this list."},
    {q:"The number of comparisons to search in a sorted array of 1024 elements using binary search (worst case) is:",opts:["512","256","10","1024"],ans:2,tag:"Search",exp:"Binary search: worst case = log₂(1024) + 1 = 10 + 1 = 11 comparisons. (≈ 10 for practical purposes)"},
    {q:"Which search algorithm is used in database indexing (B+ trees)?",opts:["Linear Search","Binary Search (conceptually in B+ tree)","Exponential Search","Hash Search"],ans:1,tag:"Search",exp:"B+ trees use a multi-level binary search tree structure for database indexing, enabling O(log n) search."},
    {q:"Sentinel search is a variation of linear search that:",opts:["Uses binary search in alternate steps","Adds target as sentinel at end to eliminate boundary check in loop","Sorts the array first","Uses hash table"],ans:1,tag:"Search",exp:"Sentinel Search: place the target at the end (sentinel). The loop terminates at the sentinel without checking index bounds, reducing branch predictions."},
    {q:"For searching in a nearly sorted array (each element at most k positions from sorted position), which search is best?",opts:["Binary Search","Modified insertion sort approach","Min-Heap based O(n log k)","Hash Search"],ans:2,tag:"Search",exp:"Nearly sorted with k offset: a min-heap of size k+1 processes elements in O(n log k) time efficiently."},
    {q:"The time complexity of searching in a balanced BST is:",opts:["O(n)","O(log n)","O(1)","O(n²)"],ans:1,tag:"Search",exp:"Balanced BST (AVL, Red-Black): height = O(log n). Search traverses from root to a node → O(log n)."}
  ]
},

{
  id: 15,
  title: "Greedy Algorithms",
  subtitle: "Test 15 | Greedy Approach",
  topic: "Algorithms",
  icon: "💰",
  questions: [
    {q:"A greedy algorithm makes decisions based on:",opts:["Global optimization","Locally optimal choice at each step","Future choices","Random selection"],ans:1,tag:"Greedy",exp:"Greedy: at each step, make the choice that seems best locally (optimal for current step) without considering future consequences."},
    {q:"Which of these problems can be solved optimally with a greedy approach?",opts:["0/1 Knapsack","Travelling Salesman Problem","Fractional Knapsack","Matrix Chain Multiplication"],ans:2,tag:"Greedy",exp:"Fractional Knapsack: sort by value/weight ratio, take greedily. Optimal because we can take fractions. 0/1 Knapsack needs DP."},
    {q:"Huffman Coding is used for:",opts:["Sorting","Data Compression","Graph traversal","Hashing"],ans:1,tag:"Greedy",exp:"Huffman Coding creates variable-length prefix codes for data compression. Frequent characters get shorter codes. Greedy + priority queue."},
    {q:"Prim's algorithm for MST is greedy because:",opts:["It sorts all edges","It always adds the minimum weight edge connecting tree to non-tree vertex","It uses dynamic programming","It backtracks"],ans:1,tag:"Greedy",exp:"Prim's makes a greedy choice at each step: add the cheapest edge that connects the current tree to an unvisited vertex."},
    {q:"Activity Selection Problem (maximum non-overlapping activities) is solved greedily by:",opts:["Sorting by start time","Sorting by finish time and selecting earliest finish first","Longest activity first","Heaviest activity first"],ans:1,tag:"Greedy",exp:"Sort by finish time. Greedily select the activity with earliest finish time that doesn't conflict with last selected."},
    {q:"When does a greedy algorithm fail to give optimal solution?",opts:["Always","When there's no optimal substructure or greedy choice property doesn't hold","For graph problems","For sorting"],ans:1,tag:"Greedy",exp:"Greedy fails when: locally optimal choices don't lead to global optimum. 0/1 Knapsack, Coin Change (arbitrary denominations) are examples."},
    {q:"Dijkstra's shortest path is greedy because:",opts:["It processes all vertices","It always processes the vertex with minimum known distance first","It uses DP table","It backtracks"],ans:1,tag:"Greedy",exp:"Dijkstra greedily selects the unvisited vertex with minimum distance. The greedy choice is correct when all weights are non-negative."},
    {q:"The coin change problem is always solvable greedily with:",opts:["Any coin denominations","Indian currency coins (special structure)","Only if denominations form canonical system","Only for US coins"],ans:2,tag:"Greedy",exp:"Greedy works for canonical coin systems (like US: 1,5,10,25,50). For arbitrary denominations, DP is needed."},
    {q:"Job Sequencing Problem (maximize profit with deadlines) uses:",opts:["BFS","Greedy — process highest profit jobs first within deadlines","Binary Search","Hashing"],ans:1,tag:"Greedy",exp:"Sort jobs by profit in decreasing order. Greedily assign each job to the latest available time slot within its deadline."},
    {q:"Kruskal's algorithm is greedy because:",opts:["It visits all vertices","It always picks the minimum weight edge that doesn't form a cycle","It processes level by level","It uses DP"],ans:1,tag:"Greedy",exp:"Kruskal's greedily selects the cheapest remaining edge that doesn't create a cycle. The greedy exchange argument proves optimality."},
    {q:"Which technique proves greedy algorithms correct?",opts:["Induction only","Greedy stays ahead / Exchange argument / Matroid theory","Memoization","Backward induction"],ans:1,tag:"Greedy",exp:"Greedy correctness is proven by: (1) Greedy stays ahead argument or (2) Exchange argument showing greedy solution = optimal."},
    {q:"Interval scheduling maximization is solved by sorting by:",opts:["Start time","Duration (shortest first)","Finish time (earliest first)","Overlap count"],ans:2,tag:"Greedy",exp:"Sort intervals by finish time. Greedily select intervals with earliest finish that don't overlap — gives maximum count."},
    {q:"Fractional Knapsack is greedy. Its time complexity is dominated by:",opts:["O(1)","O(n)","O(n log n) — sorting by value/weight ratio","O(n²)"],ans:2,tag:"Greedy",exp:"Fractional Knapsack: sort items by value/weight ratio O(n log n), then greedy fill O(n). Total O(n log n)."},
    {q:"Which data structure does Huffman Coding primarily use?",opts:["Stack","Queue","Min Priority Queue (Min-Heap)","Hash Table"],ans:2,tag:"Greedy",exp:"Huffman uses a min-heap. At each step, extract 2 minimum frequency nodes, merge them, and insert back — O(n log n) total."},
    {q:"The greedy algorithm for Minimum Spanning Tree works because of which property?",opts:["Cut Property — minimum weight edge crossing a cut is in MST","Cycle Property — maximum edge in cycle is not in MST","Both Cut and Cycle property","Neither"],ans:2,tag:"Greedy",exp:"Both Cut Property and Cycle Property are used to prove correctness of MST algorithms (Prim's and Kruskal's)."},
    {q:"A task has n intervals. Minimum number of platforms needed at a railway station is found by:",opts:["Sorting by start time only","Greedy: sort arrivals and departures separately, process with two pointers","BFS","DP"],ans:1,tag:"Greedy",exp:"Sort arrival and departure arrays. Use two pointers — when arrival < next departure, a new platform is needed."},
    {q:"The Greedy algorithm for Fractional Knapsack chooses items by:",opts:["Lightest first","Highest value first","Highest value-to-weight ratio first","Random order"],ans:2,tag:"Greedy",exp:"Fractional Knapsack greedy: sort by value/weight ratio descending. Take full items while capacity allows, then fraction of next."},
    {q:"Which is NOT a greedy algorithm?",opts:["Prim's MST","Kruskal's MST","Dijkstra's SSSP","Floyd-Warshall All-Pairs SP"],ans:3,tag:"Greedy",exp:"Floyd-Warshall is a Dynamic Programming algorithm. Prim's, Kruskal's, and Dijkstra's are all greedy."},
    {q:"In a greedy algorithm, 'optimal substructure' means:",opts:["The problem can be divided into independent subproblems","An optimal global solution contains optimal solutions to subproblems","Subproblems overlap","Recursion is needed"],ans:1,tag:"Greedy",exp:"Optimal substructure: the optimal solution to the whole problem is composed of optimal solutions to subproblems. Required for both greedy and DP."},
    {q:"Scheduling jobs to minimize total waiting time (shortest job first) is:",opts:["BFS-based","Greedy SJF — sort by burst time, shortest first","DP approach","LIFO approach"],ans:1,tag:"Greedy",exp:"SJF (Shortest Job First) minimizes average waiting time. It's a greedy algorithm — always process the shortest available job."}
  ]
},

{
  id: 16,
  title: "String Data Structures & Algorithms",
  subtitle: "Test 16 | Strings & Pattern Matching",
  topic: "Strings",
  icon: "📝",
  questions: [
    {q:"The Naive pattern matching algorithm has time complexity:",opts:["O(n)","O(nm) where n=text length, m=pattern length","O(m log n)","O(n + m)"],ans:1,tag:"String",exp:"Naive: for each position in text (n), compare pattern (m). Worst case O(nm). E.g., text='AAAAAB', pattern='AAAAB'."},
    {q:"KMP (Knuth-Morris-Pratt) algorithm improves pattern matching to:",opts:["O(nm)","O(n + m)","O(n log m)","O(m²)"],ans:1,tag:"String",exp:"KMP uses a failure function (partial match table) to skip unnecessary comparisons → O(n + m)."},
    {q:"The 'failure function' in KMP stores:",opts:["Length of pattern","Length of longest proper prefix that is also a suffix for each prefix","Number of mismatches","Position of first mismatch"],ans:1,tag:"String",exp:"KMP failure function f[i] = length of longest proper prefix of pattern[0..i] that is also a suffix."},
    {q:"Boyer-Moore algorithm is generally faster in practice because:",opts:["It preprocesses the text","It uses bad character + good suffix heuristics to skip large portions","It's linear always","It uses hashing"],ans:1,tag:"String",exp:"Boyer-Moore scans right-to-left and uses bad character / good suffix rules to jump ahead, often sublinear in practice."},
    {q:"Rabin-Karp algorithm uses ___ for pattern matching:",opts:["Failure function","Hashing to quickly compare substrings","Greedy approach","Tree structure"],ans:1,tag:"String",exp:"Rabin-Karp: compute hash of pattern and sliding window of text. If hashes match, verify character by character. O(n+m) average."},
    {q:"A Trie (Prefix Tree) is used for:",opts:["Sorting numbers","Efficient string search, autocomplete, prefix matching","Graph traversal","Heap operations"],ans:1,tag:"String",exp:"Trie stores strings by common prefixes. Each root-to-node path = a string. Enables O(m) search/insert/delete where m = string length."},
    {q:"The time complexity of inserting a string of length m into a Trie is:",opts:["O(n)","O(m)","O(log n)","O(nm)"],ans:1,tag:"String",exp:"Trie insertion: traverse/create one node per character → O(m) time regardless of total number of strings n."},
    {q:"Suffix Array is used for:",opts:["Stack operations","Efficient pattern matching — find all occurrences of a pattern in text","Graph coloring","Sorting integers"],ans:1,tag:"String",exp:"Suffix Array stores sorted suffixes of a string. Combined with LCP array, enables O(m log n) or O(m) pattern search."},
    {q:"What is the space complexity of a Trie storing n strings of average length m?",opts:["O(nm)","O(n + m)","O(n × alphabet_size × m)","O(n²)"],ans:2,tag:"String",exp:"Trie space: each node has `alphabet_size` pointers. Worst case: O(n × m × alphabet_size) if no sharing between strings."},
    {q:"The Longest Common Prefix (LCP) problem is efficiently solved using:",opts:["Greedy","Suffix Array + LCP Array","Hash Table","Binary Search only"],ans:1,tag:"String",exp:"Suffix Array stores sorted suffixes. LCP array stores LCP between consecutive suffixes. Together enable O(n) LCP queries."},
    {q:"A string of length n has how many substrings (including empty)?",opts:["n","n²","n(n+1)/2 + 1","2ⁿ"],ans:2,tag:"String",exp:"Substrings: n(n+1)/2 non-empty substrings + 1 empty = n(n+1)/2 + 1 total."},
    {q:"Edit Distance uses which technique?",opts:["Greedy","Stack","Dynamic Programming (Levenshtein)","Hashing"],ans:2,tag:"String",exp:"Edit Distance DP: dp[i][j] = min operations to convert s1[0..i] to s2[0..j]. O(mn) time and space."},
    {q:"Palindrome checking for a string can be done in:",opts:["O(n²)","O(n) — two pointer approach","O(log n)","O(n!)"],ans:1,tag:"String",exp:"Two pointer: compare s[0] with s[n-1], s[1] with s[n-2], etc. O(n) time, O(1) space."},
    {q:"Aho-Corasick algorithm is an extension of KMP for:",opts:["Single pattern matching","Multiple pattern matching simultaneously","Palindrome detection","LCS computation"],ans:1,tag:"String",exp:"Aho-Corasick builds a finite automaton from multiple patterns and searches all simultaneously in O(n + total_pattern_length + matches)."},
    {q:"Which data structure supports autocomplete efficiently?",opts:["Hash Table","Binary Search Tree","Trie","Stack"],ans:2,tag:"String",exp:"Trie: prefix search traverses the trie from root following the query characters → O(prefix_length) to find all completions."},
    {q:"The Z-algorithm computes for each position i:",opts:["Distance to previous occurrence","Length of the longest substring starting at i that is also a prefix of string","Hash value","Depth in trie"],ans:1,tag:"String",exp:"Z[i] = length of longest substring starting at position i that matches a prefix of the string. Used in O(n+m) pattern matching."},
    {q:"Manacher's algorithm finds all palindromic substrings in:",opts:["O(n²)","O(n log n)","O(n)","O(n × alphabet_size)"],ans:2,tag:"String",exp:"Manacher's finds ALL palindromic substrings of all positions in O(n) time using a clever expansion technique."},
    {q:"Suffix Tree has time and space complexity of:",opts:["O(n) build, O(n) space","O(n²) build, O(n) space","O(n log n) build, O(n²) space","O(n) build, O(n²) space"],ans:0,tag:"String",exp:"Ukkonen's algorithm builds Suffix Tree in O(n) time and O(n) space (using implicit suffix links)."},
    {q:"String hashing (polynomial rolling hash) is used to:",opts:["Sort strings","Quickly compare substrings / detect patterns (Rabin-Karp)","Build tries","Compress strings"],ans:1,tag:"String",exp:"Rolling hash: hash(s[l..r]) computed in O(1) using precomputed prefix hashes. Used in Rabin-Karp for O(1) substring comparison."},
    {q:"Which is TRUE about the KMP failure function?",opts:["It has length m (same as pattern)","It contains the length of the text","It stores character frequencies","It stores the pattern backwards"],ans:0,tag:"String",exp:"KMP failure function has length m (pattern length). f[i] = longest proper prefix of pattern[0..i] that is also a suffix."}
  ]
},

{
  id: 17,
  title: "Advanced Tree Structures",
  subtitle: "Test 17 | B-Trees, Segment Trees",
  topic: "Trees",
  icon: "🌲",
  questions: [
    {q:"A B-Tree of order m means each node has at most:",opts:["m children","m-1 children","m+1 children","2m children"],ans:0,tag:"B-Tree",exp:"B-Tree of order m: each non-root node has at most m children (and m-1 keys). Root has at least 2 children if non-leaf."},
    {q:"B-Trees are primarily used for:",opts:["In-memory sorting","Disk-based database indexing","Hash table implementation","Graph traversal"],ans:1,tag:"B-Tree",exp:"B-Trees minimize disk I/O. Large node sizes match disk page size, so few disk reads needed. Used in DBMS (MySQL, PostgreSQL)."},
    {q:"In a B+ Tree, actual data records are stored in:",opts:["Root only","Internal nodes","Leaf nodes only","All nodes"],ans:2,tag:"B-Tree",exp:"B+ Tree: only leaf nodes store data records. Internal nodes store only keys for routing. Leaf nodes are linked for range queries."},
    {q:"The height of a B-Tree with n keys and minimum degree t is:",opts:["O(n)","O(log n)","O(log_t n)","O(t)"],ans:2,tag:"B-Tree",exp:"B-Tree height = O(log_t n). With large t (matching disk block), this is very shallow — only a few disk reads needed."},
    {q:"A Segment Tree is used for:",opts:["Graph traversal","Range queries (sum/min/max) with point updates in O(log n)","Hash collision resolution","String matching"],ans:1,tag:"Segment Tree",exp:"Segment Tree: build O(n log n), query O(log n), update O(log n). Efficient for range sum/min/max queries with updates."},
    {q:"A Segment Tree for n elements uses space:",opts:["O(n)","O(n log n)","O(4n) ≈ O(n)","O(n²)"],ans:2,tag:"Segment Tree",exp:"Segment Tree stored as array of size ~4n. Accounts for the complete binary tree structure. O(n) space overall."},
    {q:"Binary Indexed Tree (Fenwick Tree) supports which operations in O(log n)?",opts:["Range Min Query","Point update and Prefix Sum query","BFS traversal","Pattern matching"],ans:1,tag:"Segment Tree",exp:"Fenwick Tree / BIT: point update and prefix sum query both in O(log n) with O(n) space — simpler than segment tree."},
    {q:"Red-Black Tree maintains balance using:",opts:["Height difference ≤ 1","Color properties (red/black) ensuring O(log n) height","Rotation only","Level ordering"],ans:1,tag:"Trees",exp:"Red-Black Tree: nodes are red or black with properties ensuring no path is twice as long as another → O(log n) height."},
    {q:"A Splay Tree is a self-balancing BST that:",opts:["Always maintains strict balance","Moves accessed node to root via rotations (splay operation)","Uses color for balancing","Has fixed height"],ans:1,tag:"Trees",exp:"Splay Tree: after each access, the accessed node is moved to root (splay). Amortized O(log n) for all operations."},
    {q:"Lazy Propagation in Segment Tree is used when:",opts:["Building the tree","Range updates are needed (update a range lazily)","Deleting nodes","Searching strings"],ans:1,tag:"Segment Tree",exp:"Lazy Propagation: instead of updating all nodes in a range immediately, store pending updates lazily. Enables O(log n) range updates."},
    {q:"The primary advantage of B+ Tree over B-Tree for database range queries is:",opts:["Faster point queries","B+ Tree leaf nodes are linked, enabling efficient range scans","B+ Tree uses less space","B+ Tree has lower height"],ans:1,tag:"B-Tree",exp:"B+ Tree leaf nodes form a linked list. Range query: find start leaf, then follow links → O(range_size + log n). B-Tree can't do this efficiently."},
    {q:"In a Trie, the number of nodes in the worst case for n strings of max length m is:",opts:["n","nm","n × m × alphabet_size","O(total_characters)"],ans:3,tag:"Trees",exp:"Trie worst case: O(total characters across all strings). Best case: heavily shared prefixes reduce nodes significantly."},
    {q:"A 2-3 Tree is a B-Tree where each internal node has:",opts:["1 or 2 children","2 or 3 children","Exactly 3 children","2 to 4 children"],ans:1,tag:"B-Tree",exp:"2-3 Tree: each internal node has 2 or 3 children (and 1 or 2 keys). It's a B-Tree of order 3."},
    {q:"Which tree structure provides worst-case O(log n) for insert/delete/search unlike hash tables?",opts:["Unbalanced BST","AVL Tree / Red-Black Tree","Complete Binary Tree","Heap"],ans:1,tag:"Trees",exp:"Balanced BSTs (AVL, Red-Black) guarantee O(log n) worst case. Hash tables have O(n) worst case with many collisions."},
    {q:"Sparse Table is used for:",opts:["Dynamic range queries with updates","Static Range Minimum Query (RMQ) in O(1) query time after O(n log n) preprocessing","Hash collision","String sorting"],ans:1,tag:"Segment Tree",exp:"Sparse Table: preprocess in O(n log n), answer Range Min/Max queries in O(1). Only for static arrays (no updates)."},
    {q:"The number of comparisons to search in a B-Tree of order m with n keys is:",opts:["O(n)","O(m × log_m n)","O(log n)","O(n/m)"],ans:1,tag:"B-Tree",exp:"Each node search: O(m) (or O(log m) with binary search). Height: O(log_m n). Total: O(m × log_m n) or O(log n)."},
    {q:"A Treap combines which two data structures?",opts:["Tree + Hash","BST + Heap (random priorities for balance)","AVL + Red-Black","Trie + Segment Tree"],ans:1,tag:"Trees",exp:"Treap: BST ordered by keys + heap ordered by random priorities. Random priorities ensure O(log n) expected height."},
    {q:"In a Segment Tree, what does each leaf node store?",opts:["Nothing","Range information","Individual element value","Index only"],ans:2,tag:"Segment Tree",exp:"Each leaf stores one element from the array. Internal nodes store aggregate (sum/min/max) of their subtree's range."},
    {q:"Which tree is used in interval scheduling and overlap detection?",opts:["BST","Interval Tree","Heap","Trie"],ans:1,tag:"Trees",exp:"Interval Tree: augmented BST for storing intervals. Supports stabbing queries (find intervals containing point x) in O(log n + output)."},
    {q:"The k-d Tree is used for:",opts:["String matching","Multi-dimensional search (nearest neighbor in k-dimensional space)","Graph traversal","Sorting"],ans:1,tag:"Trees",exp:"k-d Tree (k-dimensional tree): BST for k-dimensional points. Used in nearest neighbor search, range search in geometric problems."}
  ]
},

{
  id: 18,
  title: "Complexity Analysis",
  subtitle: "Test 18 | Time & Space Complexity",
  topic: "Algorithms",
  icon: "⏱️",
  questions: [
    {q:"Big-O notation represents:",opts:["Exact running time","Lower bound of running time","Upper bound of running time (worst case)","Average running time"],ans:2,tag:"Complexity",exp:"Big-O: O(f(n)) is an upper bound. An algorithm O(n²) runs in AT MOST cn² steps for large n."},
    {q:"Omega notation Ω(f(n)) represents:",opts:["Upper bound","Lower bound (best case)","Exact bound","Average case"],ans:1,tag:"Complexity",exp:"Big-Omega: Ω(f(n)) is a lower bound. An algorithm Ω(n log n) requires AT LEAST cn log n steps."},
    {q:"Theta notation Θ(f(n)) means:",opts:["Only upper bound","Only lower bound","Both upper AND lower bound (tight bound)","Expected value"],ans:2,tag:"Complexity",exp:"Theta: Θ(f(n)) means algorithm is BOTH O(f(n)) and Ω(f(n)). Tight bound — exact asymptotic behavior."},
    {q:"Which of the following is the fastest growing function?",opts:["O(n log n)","O(n²)","O(2ⁿ)","O(n!)"],ans:3,tag:"Complexity",exp:"Growth order: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!). n! grows fastest."},
    {q:"The space complexity of a recursive Fibonacci with memoization is:",opts:["O(1)","O(n)","O(2ⁿ)","O(n²)"],ans:1,tag:"Complexity",exp:"Memoized Fibonacci: O(n) space for the cache array + O(n) recursion stack = O(n) total."},
    {q:"Amortized analysis gives:",opts:["Worst case of single operation","Average cost per operation over a sequence (more accurate for dynamic structures)","Best case only","Exact running time"],ans:1,tag:"Complexity",exp:"Amortized analysis: average cost per operation over worst-case sequence of n operations. Dynamic arrays have O(1) amortized push."},
    {q:"What is the time complexity of the following: for(i=0;i<n;i++) for(j=0;j<n;j++) O(1)?",opts:["O(n)","O(n log n)","O(n²)","O(2n)"],ans:2,tag:"Complexity",exp:"Two nested loops each running n times: n × n = n² iterations, each O(1) → O(n²) total."},
    {q:"What is the time complexity: for(i=1;i<=n;i*=2)?",opts:["O(n)","O(n²)","O(log n)","O(n log n)"],ans:2,tag:"Complexity",exp:"i doubles each iteration: i = 1,2,4,8,...,n → log₂n iterations → O(log n)."},
    {q:"The Master Theorem applies to recurrences of the form:",opts:["T(n) = T(n-1) + f(n)","T(n) = aT(n/b) + f(n) where a≥1, b>1","T(n) = T(n-k) + f(n)","T(n) = f(T(n-1))"],ans:1,tag:"Complexity",exp:"Master Theorem: T(n) = aT(n/b) + f(n). Divide and conquer recurrences. Three cases based on f(n) vs n^(log_b a)."},
    {q:"Which of these algorithms is O(n log n) in all cases?",opts:["Quick Sort","Bubble Sort","Merge Sort","Insertion Sort"],ans:2,tag:"Complexity",exp:"Merge Sort is always O(n log n) — best, average, worst. Quick Sort is O(n²) worst case."},
    {q:"The space complexity of merge sort is:",opts:["O(1)","O(log n)","O(n)","O(n²)"],ans:2,tag:"Complexity",exp:"Merge Sort needs O(n) auxiliary array for merging + O(log n) recursion stack = O(n) dominant term."},
    {q:"O(1) space complexity means:",opts:["No variables used","Constant extra space regardless of input size","Only 1 variable","Space proportional to n"],ans:1,tag:"Complexity",exp:"O(1) space: the algorithm uses a fixed, constant amount of memory regardless of input size. In-place algorithms."},
    {q:"The time complexity of T(n) = T(n-1) + n is:",opts:["O(n)","O(n log n)","O(n²)","O(2ⁿ)"],ans:2,tag:"Complexity",exp:"T(n) = T(n-1) + n. Expanding: n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 = O(n²)."},
    {q:"P vs NP problem asks whether:",opts:["Polynomial problems are faster than NP","Every problem whose solution can be verified in polynomial time can also be SOLVED in polynomial time","NP problems have no solution","P algorithms use more space"],ans:1,tag:"Complexity",exp:"P: solvable in polynomial time. NP: verifiable in polynomial time. The P=NP question is unsolved and is the most famous open problem in CS."},
    {q:"NP-Complete problems are:",opts:["Impossible to solve","Solvable only in exponential time","In NP AND every NP problem reduces to them in polynomial time","Easier than P problems"],ans:2,tag:"Complexity",exp:"NP-Complete: problems that are in NP and are at least as hard as all NP problems. If any NP-Complete problem is in P, then P=NP."},
    {q:"The time complexity of binary search T(n) = T(n/2) + O(1) by Master Theorem is:",opts:["O(n)","O(n²)","O(log n)","O(n log n)"],ans:2,tag:"Complexity",exp:"a=1, b=2, f(n)=O(1). log_b(a) = log₂(1) = 0. f(n) = O(n⁰) = O(1) = Θ(n^0). Case 2: T(n) = O(log n)."},
    {q:"Which notation is used for best case analysis?",opts:["O(f(n))","Θ(f(n))","Ω(f(n))","o(f(n))"],ans:2,tag:"Complexity",exp:"Ω (Omega) gives lower bound — used for best case analysis. O gives upper bound (worst case). Θ is tight bound."},
    {q:"Recurrence for merge sort T(n) = 2T(n/2) + O(n) solves to:",opts:["O(n)","O(n²)","O(n log n)","O(2ⁿ)"],ans:2,tag:"Complexity",exp:"Master Theorem: a=2, b=2, f(n)=n. log_b(a) = log₂(2) = 1. f(n) = n = n¹ = Θ(n^log_b(a)). Case 2: T(n) = O(n log n)."},
    {q:"What does 'polynomial time' mean in complexity theory?",opts:["O(n!)","O(2ⁿ)","O(nᵏ) for some constant k","O(n log n) only"],ans:2,tag:"Complexity",exp:"Polynomial time = O(nᵏ) for some fixed constant k. E.g., O(n), O(n²), O(n³) are polynomial. O(2ⁿ), O(n!) are exponential."},
    {q:"The time complexity of the following code: for(i=0;i<n;i++) for(j=i;j<n;j++) O(1)?",opts:["O(n²)","O(n log n)","O(n²/2) = O(n²)","O(n³)"],ans:0,tag:"Complexity",exp:"Total iterations: n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 = O(n²). The inner loop varies but total is still quadratic."}
  ]
},

{
  id: 19,
  title: "Mixed PYQ - BPSC & STET Special",
  subtitle: "Test 19 | Previous Year Based",
  topic: "Mixed",
  icon: "🎯",
  questions: [
    {q:"In BPSC TRE exam context, which data structure is used in operating system's memory management for free blocks?",opts:["Stack","Binary Search Tree","Linked List (Free list)","2D Array"],ans:2,tag:"PYQ",exp:"OS memory management uses a free list (linked list of free memory blocks) for dynamic memory allocation."},
    {q:"Which of the following sorting algorithms is used in Java's Arrays.sort() for primitive types?",opts:["Merge Sort","Quick Sort (Dual-Pivot Quicksort)","Heap Sort","Bubble Sort"],ans:1,tag:"PYQ",exp:"Java uses Dual-Pivot Quicksort for primitive type arrays. For object arrays, it uses Tim Sort (stable merge-insertion hybrid)."},
    {q:"The postfix expression AB+C* evaluates to (A=3,B=2,C=4):",opts:["20","16","24","28"],ans:0,tag:"Stack",exp:"AB+ → 3+2=5. Push 5. C=4 pushed. 5C* → 5×4=20. Result = 20."},
    {q:"A hash table of size 7, h(k) = k mod 7. Where does key 50 go?",opts:["1","2","6","0"],ans:0,tag:"Hashing",exp:"h(50) = 50 mod 7 = 1. (50 = 7×7 + 1)"},
    {q:"Which Bihar STET CS syllabus topic covers stack, queue, linked list, trees?",opts:["Computer Networks","Data Structures","DBMS","Operating Systems"],ans:1,tag:"PYQ",exp:"Data Structures is the subject covering linear (arrays, stacks, queues, linked lists) and non-linear (trees, graphs) data structures."},
    {q:"In BPSC CS teacher context, which traversal is used to evaluate an expression tree?",opts:["Pre-order","In-order","Post-order","Level-order"],ans:2,tag:"PYQ",exp:"Expression tree evaluation uses Post-order (Left→Right→Root) — both operands evaluated before the operator."},
    {q:"If a BST has keys 10,5,15,3,7,12,20, the in-order traversal is:",opts:["3,5,7,10,12,15,20","10,5,15,3,7,12,20","3,7,5,12,20,15,10","10,5,3,7,15,12,20"],ans:0,tag:"BST",exp:"BST in-order = sorted order: 3,5,7,10,12,15,20."},
    {q:"What is the maximum number of nodes in a binary tree of depth 4 (root at depth 0)?",opts:["15","31","16","32"],ans:1,tag:"Trees",exp:"Depth 4 means height 4. Max nodes = 2^(4+1) - 1 = 2^5 - 1 = 31."},
    {q:"For an array A = [2,4,6,8,10], binary search for 6 checks:",opts:["All elements","Only first and last","Middle element first (index 2 = 6)","Second element"],ans:2,tag:"Search",exp:"Binary search: low=0, high=4, mid=2. A[2]=6=target. Found on first comparison!"},
    {q:"Which data structure is used in undo-redo operations in text editors?",opts:["Queue","Stack (two stacks: undo stack, redo stack)","BST","Priority Queue"],ans:1,tag:"Stack",exp:"Undo uses a stack (LIFO). Each action pushed. Undo pops. For redo, a second stack holds undone actions."},
    {q:"A complete binary tree with 15 nodes has height:",opts:["2","3","4","5"],ans:1,tag:"Trees",exp:"Complete binary tree: 2^3-1=7 nodes at height 2. 2^4-1=15 nodes at height 3. Height = 3."},
    {q:"The best algorithm for finding kth smallest element in a BST is:",opts:["In-order traversal (stop at kth node)","Pre-order traversal","Post-order traversal","BFS traversal"],ans:0,tag:"BST",exp:"In-order traversal of BST gives sorted order. Count nodes during traversal — stop at kth node → O(k) time."},
    {q:"LIFO stands for:",opts:["Last Input First Output","List In Free Order","Last In First Out","Linear Input Form Output"],ans:2,tag:"Basics",exp:"LIFO = Last In First Out. This is the operating principle of a Stack. The last element pushed is the first one popped."},
    {q:"In a min-heap with elements [2,5,8,10,15], which element is at the root?",opts:["15","10","2","5"],ans:2,tag:"Heap",exp:"Min-Heap property: minimum element is always at the root. Root = 2 (minimum)."},
    {q:"Which of these operations is O(1) in a doubly linked list (with tail pointer)?",opts:["Search by value","Access kth element","Insert at beginning or end","Reverse the list"],ans:2,tag:"Linked List",exp:"Doubly linked list with head and tail pointers: insert at beginning = O(1) (update head), insert at end = O(1) (update tail)."},
    {q:"A graph with V vertices and E edges stored as adjacency matrix. Space = ?",opts:["O(V + E)","O(V²)","O(E)","O(VE)"],ans:1,tag:"Graph",exp:"Adjacency matrix is V×V array regardless of edges → O(V²) space."},
    {q:"Which sorting is best for files stored on disk (external sorting)?",opts:["Quick Sort","Insertion Sort","External Merge Sort","Heap Sort"],ans:2,tag:"Sorting",exp:"External Merge Sort minimizes disk reads/writes by merging sorted runs. Used when data doesn't fit in RAM."},
    {q:"The average search time in a hash table with load factor 0.5 is approximately:",opts:["O(n)","O(1) ≈ 1.5 comparisons","O(log n)","O(n/2)"],ans:1,tag:"Hashing",exp:"With α = 0.5 (half full), expected comparisons ≈ 1/(1-α) = 2 for linear probing. O(1) amortized."},
    {q:"Prim's and Kruskal's both find MST but differ in:",opts:["The MST they find","Starting vertex choice — Prim's grows tree, Kruskal's grows forest","Time complexity always","Graph type they handle"],ans:1,tag:"Graph",exp:"Prim's starts from one vertex and grows a single tree. Kruskal's starts with all vertices as separate trees and merges."},
    {q:"A stack is empty when (array implementation, top initialized to -1):",opts:["top == 0","top == -1","top == n-1","top == n"],ans:1,tag:"Stack",exp:"TOP = -1 indicates empty stack. First push increments to 0. This is the standard convention."}
  ]
},

{
  id: 20,
  title: "Final Grand Test",
  subtitle: "Test 20 | Comprehensive",
  topic: "Mixed",
  icon: "🏆",
  questions: [
    {q:"Which of the following data structures is non-linear?",opts:["Array","Stack","Queue","Tree"],ans:3,tag:"Basics",exp:"Tree is non-linear — nodes have hierarchical parent-child relationships. Arrays, stacks, queues are linear."},
    {q:"The process of adding an element to a queue is called:",opts:["Push","Pop","Enqueue","Dequeue"],ans:2,tag:"Queue",exp:"Enqueue: add element at REAR. Dequeue: remove from FRONT."},
    {q:"AVL tree insertion may require at most ___ rotation(s):",opts:["1","2","3","n"],ans:1,tag:"AVL",exp:"At most 2 rotations (for LR or RL cases — double rotation). Single rotation cases (LL, RR) require only 1."},
    {q:"The time complexity of building a heap from n elements using Floyd's method is:",opts:["O(n log n)","O(n)","O(n²)","O(log n)"],ans:1,tag:"Heap",exp:"Floyd's bottom-up heap construction is O(n). Sum of work at each level converges to O(n)."},
    {q:"Which traversal of a graph visits all vertices at the current level before going deeper?",opts:["DFS","BFS","Post-order DFS","In-order traversal"],ans:1,tag:"Graph",exp:"BFS uses queue — visits all vertices at distance d before any vertex at distance d+1 (level by level)."},
    {q:"Quick sort is based on which algorithmic paradigm?",opts:["Dynamic Programming","Greedy","Divide and Conquer","Backtracking"],ans:2,tag:"Sorting",exp:"Quick Sort: Divide (partition around pivot) + Conquer (recursively sort partitions). Classic divide and conquer."},
    {q:"In a singly linked list, the time complexity to find the last node is:",opts:["O(1)","O(log n)","O(n)","O(n²)"],ans:2,tag:"Linked List",exp:"No direct access to last node in singly linked list (unless tail pointer maintained). Must traverse all n nodes → O(n)."},
    {q:"Which of these has worst-case O(log n) for insert, delete, and search?",opts:["Hash Table","Unsorted Array","AVL Tree / Red-Black Tree","Unsorted Linked List"],ans:2,tag:"Trees",exp:"Balanced BSTs (AVL, Red-Black) guarantee O(log n) worst case for all operations due to O(log n) height."},
    {q:"The number of different binary trees with 3 nodes is:",opts:["3","4","5","6"],ans:2,tag:"Trees",exp:"Catalan number C₃ = C(6,3)/4 = 20/4 = 5. There are 5 structurally different binary trees with 3 nodes."},
    {q:"For a graph with 5 vertices and the following edges: (1-2),(1-3),(2-4),(3-5), BFS from 1 visits:",opts:["1,2,3,4,5","1,2,4,3,5","1,3,5,2,4","Random order"],ans:0,tag:"Graph",exp:"BFS level 0: {1}. Level 1: {2,3}. Level 2: {4,5}. Order: 1,2,3,4,5."},
    {q:"The depth of a node is defined as:",opts:["Number of children","Height of subtree rooted at it","Distance from root (number of edges)","Level number"],ans:2,tag:"Trees",exp:"Depth of node = number of edges on path from root to that node. Root has depth 0."},
    {q:"Which sorting algorithm has O(n) best case AND O(n²) worst case?",opts:["Merge Sort","Heap Sort","Insertion Sort","Selection Sort"],ans:2,tag:"Sorting",exp:"Insertion Sort: O(n) best case (sorted input — 0 inversions), O(n²) worst case (reverse sorted — n(n-1)/2 inversions)."},
    {q:"Which property of Quick Sort's partition operation ensures correctness?",opts:["All elements equal to pivot go left","Pivot ends up in its final sorted position","Left part is smaller than right part","Array is sorted after one partition"],ans:1,tag:"Sorting",exp:"After partition, pivot is in its FINAL sorted position. Elements left of pivot < pivot, elements right > pivot."},
    {q:"A tree with n vertices has exactly ___ edges (if connected and acyclic):",opts:["n","n+1","n-1","2n"],ans:2,tag:"Trees",exp:"A tree (connected, acyclic graph) with n vertices has exactly n-1 edges. Adding any edge creates a cycle."},
    {q:"Dijkstra's algorithm time complexity with a Fibonacci Heap is:",opts:["O(V²)","O(E log V)","O(E + V log V)","O(VE)"],ans:2,tag:"Graph",exp:"With Fibonacci Heap: Decrease-Key is O(1) amortized. Total = O(E × 1 + V × log V) = O(E + V log V). Best for dense graphs."},
    {q:"When is Radix Sort more efficient than comparison-based sorts?",opts:["Always","When the number of digits/keys d is small (d << log n)","Never","Only for strings"],ans:1,tag:"Sorting",exp:"Radix Sort: O(d(n+k)). When d (digits) is constant and k (digit range) is small, this beats O(n log n)."},
    {q:"The two conditions for a valid Heap are:",opts:["Complete binary tree AND heap property","BST property AND balance","Sorted AND complete","Complete AND sorted"],ans:0,tag:"Heap",exp:"Heap: (1) Complete binary tree — all levels full except last, filled left-to-right. (2) Heap property — parent ≥ children (max-heap)."},
    {q:"Which algorithm can find NEGATIVE cycle in a graph?",opts:["Dijkstra","BFS","Bellman-Ford","Prim's"],ans:2,tag:"Graph",exp:"Bellman-Ford: run V-1 iterations. If further relaxation is possible in Vth iteration, a negative cycle exists."},
    {q:"A degenerate (pathological) case for Quick Sort is when:",opts:["Array is random","Pivot always divides array in equal halves","Array is already sorted (pivot always minimum or maximum)","Array has all equal elements"],ans:2,tag:"Sorting",exp:"Sorted input with naive (first/last element) pivot selection → O(n²). Use random pivot or median-of-3 to avoid."},
    {q:"Which of the following best describes the relationship: Stack is to LIFO as Queue is to:",opts:["LIFO","FIFO","FILO","LILO"],ans:1,tag:"Basics",exp:"Stack : LIFO :: Queue : FIFO. Queue is First In First Out — first element inserted is first removed."}
  ]
}

];
