---
title: Testing Library vs Enzyme
date: 2021-01-15
tags:
  - react
  - testing
  - javascript
  - frontend
  - typescript
description: Complete migration guide from Enzyme to Testing Library, covering the mindset shift, custom renders, wrapper patterns, form testing, and real-world Calendar component examples.
---

## **Introduction**

Testing Library is built around a simple philosophy: the more your tests resemble the way your software is used, the more confidence they can give you. Its three core principles are: tests only break when your app breaks (not when implementation details change), you interact with your app the same way as your users, and built-in selectors find elements the way users do to help you write inclusive code.

Imagine **AutoLot**, a car dealership chain with an online marketplace built in React/TypeScript with 400+ components. The team has been using Enzyme since 2018, but they're hitting problems: every time someone refactors a component's internal state structure, dozens of Enzyme tests break even though the user-facing behavior is unchanged. The tech lead decides to migrate to Testing Library — but gradually, not all at once.

Useful tools: [Testing Playground](https://testing-playground.com/) helps you find the right Testing Library queries interactively. Kent C. Dodds' article [Avoid Nesting When You're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing) is essential reading for writing clean, flat test structures.

Reference: [Enzyme vs React Testing Library: A Mindset Shift](https://blog.logrocket.com/enzyme-vs-react-testing-library-a-mindset-shift/)

## **The mindset shift**

The core difference between Enzyme and Testing Library is what you test. Enzyme gives you access to component internals (state, instances, lifecycle methods), while Testing Library only lets you interact with the rendered output — the same way a user would.

At AutoLot, a developer wrote this Enzyme test for a `RangeCounter` component used in the vehicle quantity selector:

```javascript
describe("RangeCounterA", () => {
  let component;
  beforeEach(() => {
    component = mount(<RangeCounterA />);
  });
  describe("when incrementing counter is allowed", () => {
    it("updates counter value correctly", () => {
      component.instance().incrementCounter();
      expect(component.state().counter).toEqual(1);
      expect(component.state().hasEdited).toEqual(true);
    });
  });
});
```

This test reaches into the component's internals — calling `instance().incrementCounter()` and inspecting `state()`. If a developer refactors the component to use hooks instead of a class, this test breaks completely even though the button still works.

The same test with Testing Library focuses on what the user sees and does:

```javascript
describe("RangeCounterB", () => {
  describe("when incrementing counter is allowed", () => {
    it("updates the counter value", async () => {
      const { getByTestId, getByText } = render(<RangeCounterB min={2} />);
      const incrementButton = getByText("+");
      fireEvent.click(incrementButton);
      expect(getByTestId("counter-value").innerHTML).toEqual("3");
    });
  });
});
```

The developer clicks the "+" button and checks the displayed value — exactly how a user would verify the counter works. Now the team can refactor from classes to hooks without touching a single test.

## **Real-world comparison: Calendar component**

At AutoLot, the `Calendar` component is the most complex piece of UI — it shows test drive schedules, handles toolbar navigation, date cell interactions, and modal editing for appointment details. The team wrote the same integration tests in both Enzyme and Testing Library side-by-side to compare approaches.

With Enzyme, the test relies heavily on DOM structure (finding buttons by index, traversing child nodes):

```javascript
// components/Calendar/__tests__/Calendar.test.tsx
describe("<Calendar /> with Enzyme", () => {
  const setup = makeSetupComponent({ component: Calendar });
  test("should have integration with the toolbar", () => {
    const { component } = setup();
    const toolbar = component.find('[data-testid="toolbar"]');
    expect(toolbar.children()).toHaveLength(9);
    const toolbarText = toolbar.text();
    expect(toolbarText).toContain(
      moment(Date.now()).format(DATE_FORMATS.TOOLBAR_LABEL),
    );
    expect(component.find("p").at(0).text()).toContain("Current view: week");
    const toolbarNextButton = toolbar.find("button").at(2);
    expect(toolbarNextButton.text()).toContain("Next");
    toolbarNextButton.simulate("click");
    const toolbarMonthButton = toolbar.find("button").at(5);
    expect(toolbarMonthButton.text()).toContain("month");
    toolbarMonthButton.simulate("click");
    const updatedToolbarText = toolbar.at(0).text();
    const expectedToolbarDate = moment(new Date(2021, 3, 19)).format(
      DATE_FORMATS.TOOLBAR_LABEL,
    );
    expect(updatedToolbarText).toContain(expectedToolbarDate);
    expect(component.find("p").at(0).text()).toContain("Current view: month");
  });
  test("should have integration with DateCellWrapper", () => {
    const { component } = setup();
    const toolbarMonthButton = component
      .find('[data-testid="toolbar"]')
      .find("button")
      .at(5);
    expect(toolbarMonthButton.text()).toContain("month");
    toolbarMonthButton.simulate("click");
    component
      .find('[data-testid="dataCellWrapper-button"]')
      .at(4)
      .simulate("click");
    const sideColumnAgenda = component.find(".rbc-agenda-table").at(1).text();
    expect(sideColumnAgenda).toContain("All Day Event very long title");
  });
});
```

The Testing Library version uses accessible queries (by role, by text) and reads much closer to a user story:

```javascript
describe('<Calendar /> with @testing-library', () => {
 test('should have integration with the toolbar', () => {
 render(<Calendar />);
 expect(screen.queryByText(moment(Date.now()).format(DATE_FORMATS.TOOLBAR_LABEL))).toBeTruthy();
 expect(screen.queryByText('Current view: week')).toBeTruthy();
 fireEvent.click(screen.getByRole('button', { name: 'Next' }));
 fireEvent.click(screen.getByRole('button', { name: 'month' }));
 expect(screen.queryByText('Current view: month')).toBeTruthy();
 expect(screen.getAllByTestId('toolbar')).toHaveLength(2);
 });
 test('should have integration with DateCellWrapper', () => {
 const { container } = render(<Calendar />);
 fireEvent.click(screen.getByRole('button', { name: 'month' }));
 fireEvent.click(screen.getAllByTestId('dataCellWrapper-button')[4]);
 expect(container.getElementsByClassName('rbc-agenda-event-cell')[0].textContent).toContain(
 'All Day Event very long title',
 );
 });
 test('Renders modal when clicking calendar event', () => {
 const useInteractiveClassesMock = useInteractiveClasses as jest.Mock<
 IInteractiveClassesProviderValue
 >;
 useInteractiveClassesMock.mockImplementationOnce(() => ({
 classInstances: [
 {
 ...mockClassInstances(new Date())[0],
 start: new Date('2021-04-19'),
 end: new Date('2021-04-19'),
 title: 'All Day Event very long title',
 subCategory: '',
 trainerName: '',
 },
 ],
 }));
 render(<Calendar />);
 expect(screen.queryByText('All Day Event very long title')).toBeTruthy();
 fireEvent.click(screen.getByText('All Day Event very long title'));
 expect(screen.queryByText('Edit')).toBeTruthy();
 fireEvent.click(screen.getByText('Edit'));
 expect(screen.queryByText('Cancel')).toBeTruthy();
 fireEvent.click(screen.getByText('Cancel'));
 });
});
```

Notice the difference: Enzyme uses `find('button').at(2)` (fragile — breaks if button order changes), while Testing Library uses `getByRole('button', { name: 'Next' })` (resilient — only breaks if the button is removed).

There's also a workaround worth noting for third-party components: when testing a `DatePicker` component, the `react-datepicker` library generates HTML that doesn't map well to Testing Library's accessible queries. In those cases, use the `container` from `render()` and query with `getElementsByClassName` or `querySelector` instead of `getByRole`/`getByText`.

## **How to test forms**

Regardless of which form library you use (Formik, React Hook Form, plain HTML), Testing Library encourages the same approach: find fields by their labels, type into them, click submit, and assert the callback was called with the right data.

At AutoLot, the lead capture form collects customer info before scheduling a test drive. Here's how the team tests it:

```javascript
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyForm } from "./myForm.js";

test("rendering and submitting a basic Formik form", async () => {
  const handleSubmit = jest.fn();
  render(<MyForm onSubmit={handleSubmit} />);
  userEvent.type(screen.getByLabelText(/first name/i), "John");
  userEvent.type(screen.getByLabelText(/last name/i), "Dee");
  userEvent.type(screen.getByLabelText(/email/i), "john.dee@someemail.com");
  userEvent.click(screen.getByRole("button", { name: /submit/i }));
  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith(
      {
        email: "john.dee@someemail.com",
        firstName: "John",
        lastName: "Dee",
      },
      expect.anything(),
    ),
  );
});
```

The key insight: `getByLabelText` finds fields the same way a screen reader does. If the label is missing or poorly associated, the query fails — which means the test also doubles as an accessibility check.

## **Resilient tests for the future**

At AutoLot, after the first round of migration, a product manager renamed the "sedan" filter button to "Sedan & Coupe" and 12 tests broke. A team member suggested two strategies to prevent this:

Use `data-testid` for elements whose visible text is likely to change, or use regex with `{ exact: false }` to match partial text:

```javascript
fireEvent.click(screen.getByText("sedan", { exact: false }));
```

This way, renaming "sedan" to "Sedan & Coupe" won't break the test. The trade-off is readability — `getByRole` and `getByText` with exact matching are more explicit about what the user sees, so use the flexible approach only for elements with frequently changing copy.

## **Custom renders**

In Testing Library, you create a custom render for every provider/wrapper your components need. There are two approaches.

At AutoLot, every component needs at least an `IntlProvider` for translations (the marketplace serves both English and Spanish-speaking customers). The first approach wraps the UI inside the wrapper component directly:

```javascript
function Wrapper({ children }) {
  return <IntlProvider locale={locale}>{children}</IntlProvider>;
}
function customRender(ui, options) {
  return render(<Wrapper>{ui}</Wrapper>, options);
}
```

The second approach uses the `wrapper` option from Testing Library's render API:

```javascript
function Wrapper({ children }) {
  return <IntlProvider locale={locale}>{children}</IntlProvider>;
}
function customRender(ui, options) {
  return render(ui, { wrapper: Wrapper, ...options });
}
```

The first approach is preferred because if you later need to pass a different `wrapper` in `options` for a specific test, you still can — the second approach would override it.

## **Migrating setupComponent to customRender**

At AutoLot, the Enzyme test suite used a `setupComponent` function that wrapped every component with all the providers it needed (theme, intl, Redux, date mocking). The migration to Testing Library meant creating equivalent wrappers and composing them into a single `customRender`.

### customRerender

Similar to `setupComponent`, you don't need to re-render the same component every time you want to test it with different props. The `customRerender` function handles this:

```javascript
test('should update the props with rerender', () => {
 type ICustomComponent = { name: string };
 const CustoComponent = ({ name }: ICustomComponent): JSX.Element => <h1>{name}</h1>;
 const firstProps: ICustomComponent = {
 name: 'hello',
 };
 const { customRerender } = customRender<ICustomComponent>(<CustoComponent {...firstProps} />);
 expect(screen.getByText('hello')).toBeTruthy();
 const secondProps: ICustomComponent = {
 name: 'abc',
 };
 customRerender(secondProps);
 expect(screen.getByText('abc')).toBeTruthy();
});
```

Always type the props — TypeScript will catch mismatches between the first render and the rerender.

### MockDateWrapper

The simplest wrapper. At AutoLot, the Calendar tests (test drive scheduling) need a fixed date so assertions on toolbar labels are deterministic. The default is always December 19, 2021:

```typescript
import MockDate from "mockdate";

const MockDateWrapper = ({
  children,
  mockDate = "2021-12-19",
}: {
  children: JSX.Element;
  mockDate?: string;
}): JSX.Element => {
  MockDate.set(mockDate);
  return children;
};
export default MockDateWrapper;
```

### ThemeWrapper

Every styled-component at AutoLot needs a `ThemeProvider`. This wrapper provides the default project theme (the dealership's brand colors), with an option to override it for specific tests:

```typescript
import { ThemeProvider } from 'styled-components';
import GlobalStyle from 'styles/GlobalStyle';
import theme from 'styles/theme';

const ThemeWrapper = ({
 children,
 customTheme,
}: {
 children: JSX.Element;
 customTheme?: Record<string, unknown>;
}): JSX.Element => (
 <>
 <GlobalStyle theme={customTheme ?? theme} />
 <ThemeProvider theme={customTheme ?? theme}>{children}</ThemeProvider>
 </>
);
export default ThemeWrapper;
```

### IntlProviderWrapper

AutoLot supports English and Spanish for its bilingual customer base. This wrapper provides `react-intl` with `en` as default locale. If no locale is passed, it returns children without wrapping — so components that don't use intl aren't affected:

```typescript
import { IntlProvider, ResolvedIntlConfig } from 'react-intl';

const IntlProviderWrapper = ({
 children,
 intl,
}: {
 children: JSX.Element;
 intl?: {
 defaultLocale?: ResolvedIntlConfig['defaultLocale'];
 locale: ResolvedIntlConfig['locale'];
 messages?: ResolvedIntlConfig['messages'];
 };
}): JSX.Element => {
 if (!intl?.locale) {
 return children;
 }
 const { defaultLocale, locale, messages } = intl;
 return (
 <IntlProvider messages={messages} defaultLocale={defaultLocale} locale={locale}>
 {children}
 </IntlProvider>
 );
};
export default IntlProviderWrapper;
```

One gotcha: internationalization tests may pass locally but fail in CI (Travis, GitHub Actions) because the server's default locale differs from your machine. Call `setupTests()` from `test_utils/testing-library/intlMock.js` to normalize the environment:

```typescript
// test_utils/testing-library/tests/IntlProviderWrapper.test.tsx
setupTests();
describe("IntlProviderWrapper", () => {
  MockDate.set("2021-12-24");
  test("using locale format and message parameter", () => {
    // ...
  });
});
```

### ReduxWrapper

Some AutoLot components (like the inventory manager and the financing calculator) depend on Redux. This wrapper creates a mock store with the same middleware stack used in the Enzyme `setupComponent`:

```typescript
import { Provider } from 'react-redux';
import merge from 'lodash/merge';
import configureStore from 'redux-mock-store';
import injectMiddleware from 'test_utils/injectMiddleware';
import { createPromise } from 'redux-promise-middleware';
import { baseComponentReduxState } from 'test_utils';
import thunk from 'redux-thunk';

const ReduxWrapper = ({
 children,
 initialState = {},
 includeBaseComponentState = false,
}: {
 children: JSX.Element;
 initialState?: Record<string, unknown>;
 includeBaseComponentState?: boolean;
}): JSX.Element => {
 const middlewares = [
 injectMiddleware({ fetch, thunk }),
 createPromise({ promiseTypeSuffixes: ['START', 'SUCCESS', 'ERROR'] }),
 ];
 const mockStore = configureStore(middlewares);
 const store = mockStore(
 merge({}, includeBaseComponentState ? baseComponentReduxState : {}, initialState),
 );
 return <Provider store={store}>{children}</Provider>;
};
export default ReduxWrapper;
```

To verify it works, the team created a full boilerplate test with a component that reads from the store:

```typescript
import { createContext, useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { ReactReduxContext } from 'react-redux';
import { baseComponentReduxState } from 'test_utils/tests';
import ReduxWrapper from '../ReduxWrapper';

type Hello = { stringValue: string };
export const TemplateStateContext = createContext<Hello>({} as Hello);

function TemplateProvider({ children }: { children: React.ReactNode }): JSX.Element {
 const value: Hello = { stringValue: 'empty' };
 return <TemplateStateContext.Provider value={value}>{children}</TemplateStateContext.Provider>;
}

function useTemplateSelector(): Hello {
 return useContext(TemplateStateContext);
}

export function TemplateSelectorProvider(): JSX.Element {
 return (
 <TemplateProvider>
 <TemplateSelector />
 </TemplateProvider>
 );
}

export function TemplateSelector(): JSX.Element {
 const { stringValue } = useTemplateSelector();
 return <h1>final: {stringValue}</h1>;
}

describe('<ReduxWrapper />', () => {
 test('should render redux with the default parameters', () => {
 render(
 <ReduxWrapper>
 <TemplateSelectorProvider />
 </ReduxWrapper>,
 );
 expect(screen.getByText('final: empty')).toBeTruthy();
 });
 test('should receive the includeBaseComponentState default value of context', () => {
 const ComponentWithBaseState = () => {
 const { store } = useContext(ReactReduxContext);
 expect(store.getState()).toStrictEqual(baseComponentReduxState);
 return <div>componentWithBaseState</div>;
 };
 render(
 <ReduxWrapper includeBaseComponentState>
 <ComponentWithBaseState />
 </ReduxWrapper>,
 );
 });
});
```

## **The customRender — gluing everything together**

This is the final piece. At AutoLot, `customRender` composes all the wrappers into a single function that replaces Enzyme's `setupComponent`. It's fully type-safe and accepts optional configuration for each wrapper:

```typescript
import { queries, Queries, render, RenderOptions, RenderResult } from '@testing-library/react';
import { ResolvedIntlConfig } from 'react-intl';
import ContextWrapper from './ContextWrapper';
import ThemeWrapper from './ThemeWrapper';
import MockDateWrapper from './MockDateWrapper';
import IntlProviderWrapper from './IntlProviderWrapper';
import ReduxWrapper from './ReduxWrapper';

export function customRender<
 ContextType,
 Q extends Queries = typeof queries,
 Container extends Element | DocumentFragment = HTMLElement
>(
 ui: JSX.Element,
 customOptions?: {
 context?: { Context: React.Context<ContextType>; providerProps: ContextType };
 theme?: Record<string, unknown>;
 mockDate?: string;
 intl?: {
 defaultLocale?: ResolvedIntlConfig['defaultLocale'];
 locale: ResolvedIntlConfig['locale'];
 messages?: ResolvedIntlConfig['messages'];
 };
 },
 options: Omit<RenderOptions<Q, Container>, 'queries'> = {},
): RenderResult<Q, Container> {
 return render(
 <ContextWrapper context={customOptions?.context}>
 <ThemeWrapper customTheme={customOptions?.theme}>
 <MockDateWrapper mockDate={customOptions?.mockDate}>
 <IntlProviderWrapper intl={customOptions?.intl}>
 <ReduxWrapper>{ui}</ReduxWrapper>
 </IntlProviderWrapper>
 </MockDateWrapper>
 </ThemeWrapper>
 </ContextWrapper>,
 options,
 );
}
export default customRender;
```

The second parameter (`customOptions`) controls the wrappers, and the third parameter (`options`) is passed directly to Testing Library's `render` — keeping the full original API available.

Here's the complete test suite that validates each wrapper works correctly through `customRender`:

```typescript
import { screen } from '@testing-library/react';
import defaultTheme from 'styles/theme';
import customRender from '../customRender';
import { CustomContext, ComponentUsignCustomContext, ICustomContext } from './ContextWrapper.test';
import { MyComponentWithTheme } from './ThemeWrapper.test';
import { ComponentWithNewDate } from './MockDateWrapper.test';
import { TemplateSelectorProvider } from './ReduxWrapper.test';

describe('customRender', () => {
 test('should render without options', () => {
 customRender(<h1>empty</h1>);
 expect(screen.getByText('empty')).toBeTruthy();
 });
 test('should render with Context', () => {
 customRender<ICustomContext>(<ComponentUsignCustomContext />, {
 context: { Context: CustomContext, providerProps: { value: 'context' } },
 });
 expect(screen.getByText('context')).toBeTruthy();
 });
 test('should render with theme', () => {
 customRender(<MyComponentWithTheme data-testid="styled-component" />);
 expect(screen.getByTestId('styled-component')).toHaveStyleRule(
 'background-color',
 defaultTheme.whiteBG,
 );
 });
 test('should render with specific date time', () => {
 customRender(<ComponentWithNewDate />);
 expect(screen.getByTestId('date')).toHaveTextContent('Sun Dec 19 2021 00:00:00 GMT+0000');
 });
 test('should render with redux', () => {
 customRender(<TemplateSelectorProvider />);
 expect(screen.getByText('final: empty')).toBeTruthy();
 });
});
```

Note the type-safe Context usage: `customRender<ICustomContext>` ensures TypeScript validates the `providerProps` shape matches the Context type.

## **Links**

- [BOD1-2432](https://beachbody.atlassian.net/browse/BOD1-2432)

## Related Notes

- [[react-forwardRef|Forwarding Ref]]
- [[testing-concepts-notes|Testing Concepts Notes]]
- [[testing-library-vs-enzyme|Testing Library vs Enzyme]]
