import "./styles.css";

import React, {
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  useDebugValue,
  useDeferredValue,
  useTransition,
  useId,
  useSyncExternalStore,
  useInsertionEffect,
  createContext,
  forwardRef,
  memo,
  lazy,
  Suspense,
  Component,
  createPortal,
} from "react";

// =============================================================================
// CONTEXT API DEMONSTRATION
// =============================================================================
// Context provides a way to pass data through the component tree without
// having to pass props down manually at every level. Think of it as a
// "global state" that components can subscribe to.

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

const UserContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

// =============================================================================
// REDUCER PATTERN DEMONSTRATION
// =============================================================================
// useReducer is an alternative to useState for managing complex state logic.
// It follows the Redux pattern: (state, action) => newState
// Use it when you have multiple sub-values or when the next state depends
// on the previous one in a complex way.

const counterReducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      // Reconciliation note: React will compare this new state object with the
      // previous one. Since we're returning a new object, React knows it needs
      // to re-render any components that depend on this state.
      return {
        ...state,
        count: state.count + 1,
        history: [...state.history, "increment"],
      };
    case "DECREMENT":
      return {
        ...state,
        count: state.count - 1,
        history: [...state.history, "decrement"],
      };
    case "RESET":
      return { count: 0, history: ["reset"] };
    case "SET_STEP":
      return { ...state, step: action.payload };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

// =============================================================================
// EXTERNAL STORE DEMONSTRATION
// =============================================================================
// useSyncExternalStore allows React components to safely and efficiently
// subscribe to external data sources. This is crucial for state management
// libraries that exist outside of React's state system.

const createExternalStore = () => {
  let state = { online: navigator.onLine };
  const listeners = new Set();

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSnapshot = () => state;

  const updateOnlineStatus = () => {
    state = { online: navigator.onLine };
    listeners.forEach((listener) => listener());
  };

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  return { subscribe, getSnapshot };
};

const externalStore = createExternalStore();

// =============================================================================
// ERROR BOUNDARY DEMONSTRATION
// =============================================================================
// Error boundaries catch JavaScript errors anywhere in their child component
// tree, log those errors, and display a fallback UI instead of crashing.
// Note: Error boundaries only catch errors in class components, not hooks.

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.log("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            border: "2px solid red",
            borderRadius: "8px",
          }}
        >
          <h3>Something went wrong!</h3>
          <p>Error: {this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// LAZY LOADING AND CODE SPLITTING DEMONSTRATION
// =============================================================================
// React.lazy enables you to render a dynamic import as a regular component.
// This automatically creates a separate bundle that will be loaded only when
// the component is first rendered, improving initial load performance.

const LazyComponent = lazy(() => {
  // Simulate loading delay to demonstrate Suspense
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div
            style={{
              padding: "10px",
              background: "#e7f3ff",
              borderRadius: "4px",
            }}
          >
            <h4>🚀 I'm a lazy-loaded component!</h4>
            <p>
              I was loaded dynamically when you needed me, not at initial page
              load.
            </p>
          </div>
        ),
      });
    }, 1000);
  });
});

// =============================================================================
// FORWARD REF DEMONSTRATION
// =============================================================================
// forwardRef allows parent components to access child component's DOM elements
// or imperative methods. This breaks encapsulation but is sometimes necessary
// for libraries or specific use cases.

const FancyInput = forwardRef((props, ref) => {
  const [focused, setFocused] = useState(false);

  // useImperativeHandle customizes the instance value that is exposed to
  // parent components when using ref. This lets you control what the parent
  // can access, maintaining encapsulation while providing necessary APIs.
  useImperativeHandle(ref, () => ({
    focus: () => {
      ref.current?.focus();
      setFocused(true);
    },
    blur: () => {
      ref.current?.blur();
      setFocused(false);
    },
    getValue: () => ref.current?.value || "",
    clear: () => {
      if (ref.current) ref.current.value = "";
    },
  }));

  return (
    <input
      ref={ref}
      style={{
        padding: "8px",
        border: `2px solid ${focused ? "#4CAF50" : "#ddd"}`,
        borderRadius: "4px",
        outline: "none",
        transition: "border-color 0.2s",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
});

// =============================================================================
// MEMOIZATION DEMONSTRATION
// =============================================================================
// React.memo is a higher order component that memoizes the result of a component.
// It only re-renders if its props have changed. This is React's built-in
// optimization for preventing unnecessary re-renders.

const ExpensiveChild = memo(({ data, onUpdate }) => {
  console.log("ExpensiveChild rendering with data:", data);

  // Simulate expensive computation
  const expensiveValue = useMemo(() => {
    console.log("Computing expensive value...");
    let result = 0;
    for (let i = 0; i < data.iterations; i++) {
      result += Math.random();
    }
    return result.toFixed(2);
  }, [data.iterations]);

  return (
    <div
      style={{
        padding: "10px",
        background: "#fff3cd",
        borderRadius: "4px",
        margin: "10px 0",
      }}
    >
      <p>Expensive computation result: {expensiveValue}</p>
      <button onClick={() => onUpdate(data.id)}>Update this item</button>
    </div>
  );
});

// =============================================================================
// PORTAL DEMONSTRATION COMPONENT
// =============================================================================
// Portals provide a way to render children into a DOM node that exists
// outside the DOM hierarchy of the parent component. Great for modals, tooltips.

const Portal = ({ children, target = document.body }) => {
  return createPortal(children, target);
};

// =============================================================================
// MAIN COMPREHENSIVE DEMO COMPONENT
// =============================================================================

const ComprehensiveReactDemo = () => {
  // =========================================================================
  // BASIC STATE MANAGEMENT WITH useState
  // =========================================================================
  // useState returns a stateful value and a function to update it.
  // During the initial render, the returned state is the same as the value
  // passed as the first argument (initialState).

  const [count, setCount] = useState(0);
  const [text, setText] = useState("Hello React!");
  const [items, setItems] = useState([
    { id: 1, name: "Learn React", completed: false },
    { id: 2, name: "Build something awesome", completed: false },
  ]);

  // =========================================================================
  // COMPLEX STATE WITH useReducer
  // =========================================================================
  // useReducer is usually preferable to useState when you have complex state
  // logic that involves multiple sub-values or when the next state depends
  // on the previous one.

  const [counterState, dispatchCounter] = useReducer(counterReducer, {
    count: 0,
    step: 1,
    history: ["initialized"],
  });

  // =========================================================================
  // CONTEXT CONSUMPTION
  // =========================================================================
  // useContext accepts a context object (the value returned from React.createContext)
  // and returns the current context value for that context.

  const themeContext = useContext(ThemeContext);
  const userContext = useContext(UserContext);

  // =========================================================================
  // REFS AND DOM INTERACTION
  // =========================================================================
  // useRef returns a mutable ref object whose .current property is initialized
  // to the passed argument. It's like a "box" that can hold a mutable value
  // in its .current property. Unlike state, changing a ref doesn't trigger re-renders.

  const inputRef = useRef(null);
  const fancyInputRef = useRef(null);
  const renderCountRef = useRef(0);
  const intervalRef = useRef(null);

  // =========================================================================
  // PERFORMANCE OPTIMIZATION WITH useMemo
  // =========================================================================
  // useMemo returns a memoized value. It only recomputes the memoized value
  // when one of the dependencies has changed. This optimization helps to
  // avoid expensive calculations on every render.

  const expensiveData = useMemo(() => {
    console.log("Computing expensive data...");
    return items.map((item) => ({
      ...item,
      iterations: count * 1000 + Math.floor(Math.random() * 1000),
    }));
  }, [items, count]); // Only recompute when items or count changes

  const sortedItems = useMemo(() => {
    console.log("Sorting items...");
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // =========================================================================
  // CALLBACK OPTIMIZATION WITH useCallback
  // =========================================================================
  // useCallback returns a memoized callback. It's useful when passing callbacks
  // to optimized child components that rely on reference equality to prevent
  // unnecessary renders (like React.memo components).

  const handleItemUpdate = useCallback((itemId) => {
    console.log("Updating item:", itemId);
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  }, []); // Empty dependency array means this callback never changes

  const handleAddItem = useCallback(() => {
    const newItem = {
      id: Date.now(),
      name: `New item ${Date.now()}`,
      completed: false,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  }, []);

  // =========================================================================
  // EXTERNAL STORE INTEGRATION
  // =========================================================================
  // useSyncExternalStore subscribes to an external store and re-renders
  // when the store changes. This is crucial for integrating with external
  // state management libraries.

  const externalStoreState = useSyncExternalStore(
    externalStore.subscribe,
    externalStore.getSnapshot
  );

  // =========================================================================
  // CONCURRENT FEATURES (React 18+)
  // =========================================================================
  // useTransition lets you mark state updates as non-urgent. React will
  // interrupt non-urgent updates to handle more urgent ones (like user input).

  const [isPending, startTransition] = useTransition();
  const [urgentCount, setUrgentCount] = useState(0);
  const [nonUrgentList, setNonUrgentList] = useState([]);

  // useDeferredValue accepts a value and returns a new copy of the value
  // that will defer to more urgent updates. Think of it as a way to "debounce"
  // a value, but built into React's scheduling.

  const deferredText = useDeferredValue(text);

  // =========================================================================
  // UNIQUE ID GENERATION
  // =========================================================================
  // useId is a hook for generating unique IDs that are stable across the
  // server and client, while avoiding hydration mismatches.

  const formId = useId();
  const labelId = useId();

  // =========================================================================
  // DEBUG VALUE FOR CUSTOM HOOKS
  // =========================================================================
  // useDebugValue can be used to display a label for custom hooks in React DevTools.
  // This is only for development and has no effect in production.

  useDebugValue(`Render count: ${renderCountRef.current}`);

  // =========================================================================
  // LAYOUT EFFECTS
  // =========================================================================
  // useLayoutEffect is identical to useEffect, but it fires synchronously
  // after all DOM mutations. Use this to read layout from the DOM and
  // synchronously re-render.

  useLayoutEffect(() => {
    // This runs synchronously after all DOM mutations but before the browser paints
    console.log("Layout effect: DOM updated, about to paint");

    // Example: Measuring element dimensions
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      console.log("Input dimensions:", rect.width, "x", rect.height);
    }
  });

  // =========================================================================
  // INSERTION EFFECTS (React 18+)
  // =========================================================================
  // useInsertionEffect is similar to useEffect, but it fires before all DOM mutations.
  // This is primarily for CSS-in-JS libraries to inject styles before reading layout.

  useInsertionEffect(() => {
    // This is where CSS-in-JS libraries would inject styles
    console.log("Insertion effect: Before DOM mutations");
  }, []);

  // =========================================================================
  // SIDE EFFECTS WITH useEffect
  // =========================================================================
  // useEffect serves the same purpose as componentDidMount, componentDidUpdate,
  // and componentWillUnmount combined. It runs after the render is committed to the screen.

  // Effect with no dependencies - runs after every render
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`Component rendered ${renderCountRef.current} times`);
  });

  // Effect with empty dependency array - runs only once after initial render
  useEffect(() => {
    console.log("Component mounted - this runs only once");

    // Set up a timer
    intervalRef.current = setInterval(() => {
      console.log("Timer tick");
    }, 5000);

    // Cleanup function - equivalent to componentWillUnmount
    return () => {
      console.log("Cleaning up timer");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty array means this effect runs once

  // Effect with dependencies - runs when dependencies change
  useEffect(() => {
    console.log("Count changed to:", count);
    document.title = `Count: ${count}`;

    // Cleanup runs before the next effect and on unmount
    return () => {
      document.title = "React Demo";
    };
  }, [count]); // Only re-run when count changes

  // Effect for handling complex async operations
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!cancelled) {
          console.log("Async operation completed");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Async operation failed:", error);
        }
      }
    };

    fetchData();

    // Cleanup to prevent memory leaks and race conditions
    return () => {
      cancelled = true;
    };
  }, [text]); // Re-run when text changes

  // =========================================================================
  // EVENT HANDLERS AND FORM MANAGEMENT
  // =========================================================================

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with text:", text);

    // Demonstrate imperative ref operations
    if (fancyInputRef.current) {
      console.log("Fancy input value:", fancyInputRef.current.getValue());
      fancyInputRef.current.clear();
    }
  };

  const handleTransitionUpdate = () => {
    // Urgent update - happens immediately
    setUrgentCount((c) => c + 1);

    // Non-urgent update - can be interrupted
    startTransition(() => {
      setNonUrgentList((list) => [
        ...list,
        `Item ${list.length + 1} - ${new Date().toLocaleTimeString()}`,
      ]);
    });
  };

  const ErrorProneComponent = () => {
    const [shouldError, setShouldError] = useState(false);

    if (shouldError) {
      throw new Error("Intentional error for demonstration");
    }

    return (
      <div
        style={{ padding: "10px", background: "#d4edda", borderRadius: "4px" }}
      >
        <p>This component can throw an error</p>
        <button onClick={() => setShouldError(true)}>
          Trigger Error (demonstrates Error Boundary)
        </button>
      </div>
    );
  };

  // =========================================================================
  // PORTAL MODAL STATE
  // =========================================================================

  const [showModal, setShowModal] = useState(false);
  const [showLazy, setShowLazy] = useState(false);

  // =========================================================================
  // RENDER FUNCTION - THE RECONCILIATION SHOWCASE
  // =========================================================================
  // React's reconciliation algorithm compares the new element tree with the
  // previous one and determines what changes need to be made to the DOM.
  // Key concepts demonstrated here:
  // 1. Keys help React identify which items have changed, are added, or are removed
  // 2. Conditional rendering creates different tree structures
  // 3. Component updates trigger re-renders of children

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>🚀 Comprehensive React Hooks & Concepts Demo</h1>

      {/* ===================================================================== */}
      {/* BASIC STATE AND EVENT HANDLING */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>📊 Basic State Management (useState)</h2>
        <p>
          Current count: <strong>{count}</strong>
        </p>
        <p>
          Render count: <strong>{renderCountRef.current}</strong>
        </p>

        <div style={{ marginBottom: "15px" }}>
          <button
            onClick={() => setCount((c) => c + 1)}
            style={{ marginRight: "10px" }}
          >
            Increment
          </button>
          <button
            onClick={() => setCount((c) => c - 1)}
            style={{ marginRight: "10px" }}
          >
            Decrement
          </button>
          <button onClick={() => setCount(0)}>Reset</button>
        </div>

        <div>
          <label htmlFor={formId}>
            Text Input (demonstrates controlled components):
          </label>
          <input
            id={formId}
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* COMPLEX STATE WITH useReducer */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>🔄 Complex State Management (useReducer)</h2>
        <p>
          Counter: <strong>{counterState.count}</strong>
        </p>
        <p>
          Step: <strong>{counterState.step}</strong>
        </p>
        <p>History: {counterState.history.join(" → ")}</p>

        <div style={{ marginBottom: "15px" }}>
          <button
            onClick={() => dispatchCounter({ type: "INCREMENT" })}
            style={{ marginRight: "10px" }}
          >
            +{counterState.step}
          </button>
          <button
            onClick={() => dispatchCounter({ type: "DECREMENT" })}
            style={{ marginRight: "10px" }}
          >
            -{counterState.step}
          </button>
          <button
            onClick={() => dispatchCounter({ type: "RESET" })}
            style={{ marginRight: "10px" }}
          >
            Reset
          </button>
        </div>

        <div>
          <label>
            Step size:
            <input
              type="number"
              value={counterState.step}
              onChange={(e) =>
                dispatchCounter({
                  type: "SET_STEP",
                  payload: parseInt(e.target.value) || 1,
                })
              }
              style={{ marginLeft: "10px", width: "60px", padding: "2px" }}
            />
          </label>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* MEMOIZATION AND PERFORMANCE */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>⚡ Performance Optimization (useMemo, useCallback, React.memo)</h2>
        <p>The components below demonstrate React's optimization strategies:</p>

        <div style={{ marginBottom: "15px" }}>
          <button onClick={handleAddItem} style={{ marginRight: "10px" }}>
            Add Item (triggers expensive recalculations)
          </button>
          <button onClick={handleTransitionUpdate}>
            Update with Transition (demonstrates concurrent features)
          </button>
          {isPending && (
            <span style={{ marginLeft: "10px", color: "#666" }}>
              ⏳ Updating...
            </span>
          )}
        </div>

        <div>
          <h4>📝 Sorted Items (useMemo):</h4>
          <ul>
            {sortedItems.map((item) => (
              <li
                key={item.id}
                style={{
                  textDecoration: item.completed ? "line-through" : "none",
                  marginBottom: "5px",
                }}
              >
                {item.name} {item.completed && "✅"}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>🔥 Expensive Child Components (React.memo + useCallback):</h4>
          {expensiveData.map((item) => (
            <ExpensiveChild
              key={item.id}
              data={item}
              onUpdate={handleItemUpdate}
            />
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CONCURRENT FEATURES AND DEFERRED VALUES */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>🔄 Concurrent Features (React 18+)</h2>
        <p>
          Urgent count (immediate updates): <strong>{urgentCount}</strong>
        </p>
        <p>
          Text: <strong>{text}</strong>
        </p>
        <p>
          Deferred text (delayed updates): <strong>{deferredText}</strong>
        </p>

        <div>
          <h4>📋 Non-urgent list (transition updates):</h4>
          <ul style={{ maxHeight: "150px", overflowY: "auto" }}>
            {nonUrgentList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* REFS AND IMPERATIVE OPERATIONS */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>🎯 Refs and Imperative Handle</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: "15px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor={labelId}>Regular input (useRef):</label>
            <input
              id={labelId}
              ref={inputRef}
              type="text"
              placeholder="Focus me with the button below"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Fancy input (forwardRef + useImperativeHandle):</label>
            <FancyInput
              ref={fancyInputRef}
              placeholder="I have custom methods!"
              style={{ marginLeft: "10px" }}
            />
          </div>

          <div>
            <button type="submit" style={{ marginRight: "10px" }}>
              Submit Form
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              style={{ marginRight: "10px" }}
            >
              Focus Regular Input
            </button>
            <button
              type="button"
              onClick={() => fancyInputRef.current?.focus()}
              style={{ marginRight: "10px" }}
            >
              Focus Fancy Input
            </button>
            <button
              type="button"
              onClick={() => fancyInputRef.current?.clear()}
            >
              Clear Fancy Input
            </button>
          </div>
        </form>
      </section>

      {/* ===================================================================== */}
      {/* EXTERNAL STORE INTEGRATION */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>🌐 External Store Integration</h2>
        <p>
          Browser online status:
          <span
            style={{
              marginLeft: "10px",
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: externalStoreState.online
                ? "#d4edda"
                : "#f8d7da",
              color: externalStoreState.online ? "#155724" : "#721c24",
            }}
          >
            {externalStoreState.online ? "🟢 Online" : "🔴 Offline"}
          </span>
        </p>
        <p>
          <small>Try disconnecting your internet to see this change!</small>
        </p>
      </section>

      {/* ===================================================================== */}
      {/* ERROR BOUNDARIES */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>🛡️ Error Boundaries</h2>
        <p>Error boundaries catch and handle errors in the component tree:</p>
        <ErrorBoundary>
          <ErrorProneComponent />
        </ErrorBoundary>
      </section>

      {/* ===================================================================== */}
      {/* CODE SPLITTING AND SUSPENSE */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>📦 Code Splitting and Suspense</h2>
        <button
          onClick={() => setShowLazy(!showLazy)}
          style={{ marginBottom: "15px" }}
        >
          {showLazy ? "Hide" : "Load"} Lazy Component
        </button>

        {showLazy && (
          <Suspense
            fallback={
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <p>🔄 Loading lazy component...</p>
              </div>
            }
          >
            <LazyComponent />
          </Suspense>
        )}
      </section>

      {/* ===================================================================== */}
      {/* PORTALS */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>🚪 Portals</h2>
        <p>Portals render components outside the normal DOM hierarchy:</p>
        <button onClick={() => setShowModal(!showModal)}>
          {showModal ? "Close" : "Open"} Portal Modal
        </button>

        {showModal && (
          <Portal>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  maxWidth: "400px",
                }}
              >
                <h3>🚪 I'm rendered in a Portal!</h3>
                <p>
                  I exist outside the normal component tree but can still access
                  props and state.
                </p>
                <button onClick={() => setShowModal(false)}>Close Modal</button>
              </div>
            </div>
          </Portal>
        )}
      </section>

      {/* ===================================================================== */}
      {/* RECONCILIATION DEMONSTRATION */}
      {/* ===================================================================== */}

      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>🔄 Reconciliation Process</h2>
        <p>React's reconciliation algorithm efficiently updates the DOM by:</p>
        <ul>
          <li>
            <strong>Diffing:</strong> Comparing new and old element trees
          </li>
          <li>
            <strong>Keys:</strong> Identifying which list items changed (see the
            sorted list above)
          </li>
          <li>
            <strong>Component identity:</strong> Determining if components are
            the same type
          </li>
          <li>
            <strong>Batching:</strong> Grouping multiple state updates together
          </li>
          <li>
            <strong>Fiber architecture:</strong> Breaking work into chunks for
            better performance
          </li>
        </ul>

        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            backgroundColor: "#e7f3ff",
            borderRadius: "4px",
          }}
        >
          <p>
            <strong>🧠 What's happening behind the scenes:</strong>
          </p>
          <p>
            Every time you interact with this component, React creates a new
            virtual DOM tree, compares it with the previous one, and only
            updates the parts of the real DOM that changed. This is why React is
            so efficient!
          </p>
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "20px",
          borderTop: "1px solid #ddd",
          color: "#666",
        }}
      >
        <p>🎉 You've seen every major React concept in action!</p>
        <p>
          Open your browser's developer console to see the detailed logging of
          React's lifecycle methods and optimizations.
        </p>
      </footer>
    </div>
  );
};

// =============================================================================
// CONTEXT PROVIDERS WRAPPER
// =============================================================================
// This wraps our main component with context providers to demonstrate
// the Context API and how data flows through the component tree.

export default function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);

  const themeContextValue = {
    theme,
    toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  };

  const userContextValue = {
    user,
    login: (userData) => setUser(userData),
    logout: () => setUser(null),
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <UserContext.Provider value={userContextValue}>
        <div
          style={{
            backgroundColor: theme === "light" ? "#ffffff" : "#2d3748",
            color: theme === "light" ? "#000000" : "#ffffff",
            minHeight: "100vh",
            transition: "all 0.3s ease",
          }}
        >
          <ComprehensiveReactDemo />
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}
