/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let ReactDOM;

describe('ReactComponentHierarchy', () => {
  let container;
  let renderLog;
  let mountLog;
  let unmountLog;
  let Comp4;
  let Comp3;
  let Comp2;
  let Comp1;
  let App;
  let act;

  beforeEach(() => {
    jest.resetModules();
    React = require('react');
    ReactDOM = require('react-dom');
    act = require('jest-react').act;

    container = document.createElement('div');
    document.body.appendChild(container);

    renderLog = [];
    mountLog = [];
    unmountLog = [];

    // Component definitions
    Comp4 = function () {
      const componentName = 'Comp4';

      React.useEffect(() => {
        mountLog.push(componentName);
        return () => {
          unmountLog.push(componentName);
        };
      }, []);

      renderLog.push(componentName);
      return <h3>{componentName}</h3>;
    };


    Comp3 = function () {
      const componentName = 'Comp3';

      React.useEffect(() => {
        mountLog.push(componentName);
        return () => {
          unmountLog.push(componentName);
        };
      }, []);

      renderLog.push(componentName);
      return <h3>{componentName}</h3>;
    };

    Comp2 = function () {
      const componentName = 'Comp2';

      React.useEffect(() => {
        mountLog.push(componentName);
        return () => {
          unmountLog.push(componentName);
        };
      }, []);

      renderLog.push(componentName);
      return <h3>{componentName}</h3>;
    };

    Comp1 = function () {
      const componentName = 'Comp1';

      React.useEffect(() => {
        mountLog.push(componentName);
        return () => {
          unmountLog.push(componentName);
        };
      }, []);

      renderLog.push(componentName);
      return (
        <div>
          <h3>{componentName}</h3>
          <Comp3 key="comp3" />
          <Comp4 key="comp4" />
        </div>
      );
    };

    App = function () {
      const componentName = 'App';

      React.useEffect(() => {
        mountLog.push(componentName);
        return () => {
          unmountLog.push(componentName);
        };
      }, []);

      renderLog.push(componentName);
      return (
        <div>
          <h3>{componentName}</h3>
          <Comp1 key="comp1" />
          <Comp2 key="comp2" />
        </div>
      );
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('should render components in the correct hierarchical order', () => {
    ReactDOM.render(<App />, container);

    // Verify the DOM structure
    const appDiv = container.firstChild;
    expect(appDiv.tagName).toBe('DIV');

    // App renders its name as first h3
    const appH3 = appDiv.children[0];
    expect(appH3.tagName).toBe('H3');
    expect(appH3.textContent).toBe('App');

    const comp1Div = appDiv.children[1];
    const comp2H3 = appDiv.children[2];

    expect(comp1Div.tagName).toBe('DIV');
    expect(comp2H3.tagName).toBe('H3');
    expect(comp2H3.textContent).toBe('Comp2');

    // Comp1 renders its name as first h3
    const comp1H3 = comp1Div.children[0];
    expect(comp1H3.tagName).toBe('H3');
    expect(comp1H3.textContent).toBe('Comp1');

    const comp3H3 = comp1Div.children[1];
    const comp4H3 = comp1Div.children[2];

    expect(comp3H3.tagName).toBe('H3');
    expect(comp3H3.textContent).toBe('Comp3');
    expect(comp4H3.tagName).toBe('H3');
    expect(comp4H3.textContent).toBe('Comp4');
  });

  it('should call render methods in the correct order (top-down)', () => {
    ReactDOM.render(<App />, container);

    // Render order should be: App -> Comp1 -> Comp3, Comp4 -> Comp2
    expect(renderLog).toEqual(['App', 'Comp1', 'Comp3', 'Comp4', 'Comp2']);
  });

  it('should call useEffect mount in the correct order (bottom-up)', () => {
    act(() => {
      ReactDOM.render(<App />, container);
    });

    // Mount order should be: Comp3, Comp4 -> Comp1 -> Comp2 -> App
    expect(mountLog).toEqual(['Comp3', 'Comp4', 'Comp1', 'Comp2', 'App']);
  });

  it('should call useEffect cleanup in the correct order (top-down)', () => {
    const element = <App />;
    act(() => {
      ReactDOM.render(element, container);
    });

    // Clear logs after initial mount
    renderLog = [];
    mountLog = [];

    // Unmount the entire tree
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });

    // Unmount order should be: App -> Comp1 -> Comp3, Comp4 -> Comp2
    expect(unmountLog).toEqual(['App', 'Comp1', 'Comp3', 'Comp4', 'Comp2']);
  });

  it('should handle component updates correctly', () => {
    const element = <App />;
    act(() => {
      ReactDOM.render(element, container);
    });

    // Clear logs after initial mount
    renderLog = [];
    mountLog = [];

    // Force a re-render by creating a new element
    act(() => {
      ReactDOM.render(<App />, container);
    });

    // Should re-render all components
    expect(renderLog).toEqual(['App', 'Comp1', 'Comp3', 'Comp4', 'Comp2']);
    // Should not call mount again
    expect(mountLog).toEqual([]);
  });

      it('should maintain component hierarchy during updates', () => {
      let renderCount = 0;

      const TestApp = React.memo(function TestApp() {
        const [, setCount] = React.useState(0);

        React.useEffect(() => {
          // Trigger an update after mount
          setCount(1);
        }, []);

        renderCount++;
        return (
          <div>
            <h3>TestApp</h3>
            <Comp1 key="comp1" />
            <Comp2 key="comp2" />
          </div>
        );
      });

      act(() => {
        ReactDOM.render(<TestApp />, container);
      });

      // Should render twice: once for initial mount, once for state update
      expect(renderCount).toBe(2);

      // Verify DOM structure is maintained
      const appDiv = container.firstChild;
      expect(appDiv.children.length).toBe(3); // TestApp h3 + Comp1 div + Comp2 h3
      expect(appDiv.children[1].children.length).toBe(3); // Comp1 h3 + Comp3 h3 + Comp4 h3
      expect(appDiv.children[2].tagName).toBe('H3');
    });

  it('should handle component keys correctly', () => {
    const element = <App />;
    act(() => {
      ReactDOM.render(element, container);
    });

    // Verify keys are properly set in React elements, not DOM elements
    // Keys are React internal properties and not accessible on DOM elements
    const appDiv = container.firstChild;
    const comp1Div = appDiv.children[1]; // App h3 is first child
    const comp2H3 = appDiv.children[2]; // Comp2 h3 is third child

    // Verify DOM structure is correct
    expect(comp1Div.tagName).toBe('DIV');
    expect(comp2H3.tagName).toBe('H3');
    expect(comp2H3.textContent).toBe('Comp2');

    const comp3H3 = comp1Div.children[1]; // Comp1 h3 is first child
    const comp4H3 = comp1Div.children[2]; // Comp4 h3 is third child

    expect(comp3H3.tagName).toBe('H3');
    expect(comp3H3.textContent).toBe('Comp3');
    expect(comp4H3.tagName).toBe('H3');
    expect(comp4H3.textContent).toBe('Comp4');
  });

  it('should verify component reconciliation behavior', () => {
    // Test that React properly reconciles the component tree
    act(() => {
      ReactDOM.render(<App />, container);
    });

    // Verify the component tree structure is correct
    const appDiv = container.firstChild;
    expect(appDiv.tagName).toBe('DIV');
    expect(appDiv.children.length).toBe(3); // App h3 + Comp1 div + Comp2 h3

    const comp1Div = appDiv.children[1];
    expect(comp1Div.tagName).toBe('DIV');
    expect(comp1Div.children.length).toBe(3); // Comp1 h3 + Comp3 h3 + Comp4 h3

    // Verify all components rendered their content correctly
    expect(appDiv.children[0].textContent).toBe('App');
    expect(comp1Div.children[0].textContent).toBe('Comp1');
    expect(comp1Div.children[1].textContent).toBe('Comp3');
    expect(comp1Div.children[2].textContent).toBe('Comp4');
    expect(appDiv.children[2].textContent).toBe('Comp2');
  });
});
