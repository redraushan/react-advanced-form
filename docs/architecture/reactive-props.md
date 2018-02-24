# Reactive props
* [Specification](#specification)
* [Declaration](#declaration)
* [Delegated subscriptions](#delegated-subscriptions)

## Specification
*Reactive prop* - is a field's prop, which value can be resolved automatically using live subscriptions to the changes of the target fields.

As may be clear from the name, reactive props use the principles of [Reactive programming](https://en.wikipedia.org/wiki/Reactive_programming), allowing the form to listen and react to certain events.

> Right now only `required` is supported as the reactive prop.

## Declaration
```jsx
<Input
  name="fieldOne"
  initialValue="foo" />
<Input
  name="fieldTwo"
  required={({ fields }) => {
    return fields.fieldOne && !!fields.fieldOne.value;
  }}>
```

In the example above, `fieldTwo` has a reactive prop `required`, which value depends on the value of another field - `fieldOne`. By referencing other fields (targets) within the reactive prop value resolver, React Advanced Form creates subscriptions to the props changes of those target fields. For example, in this case a new subscription was created to watch the changes of `fieldOne.value` and resolve `fieldTwo.required` each time that value changes. It also resolves the value of the reactive prop initially, so that subscribed fields are rendered with the proper reactive prop values. That being sad, `fieldTwo.required` will have `true` as its initial value, since `fieldOne.value` is `foo`.

> Note that since fields can be mounted conditionally, it's recommended to handle that when referencing their props. By writing `fields.fieldOne && fields.fieldOne.value` we ensure that `fields.fieldOne` exists before trying to access its `value` prop.

## Delegated subscriptions
Reactive props can also reference the fields which are not yet mounted at the moment when the resolver is declared. In this scenario there is no way to know which target field's props changes must be watched, therefore, creating a subscription to them is impossible.

However, React Advanced Form still knows which field has been referenced, regardless of the mounting status of the latter. In case the referenced field is not mounted, a *delegated subscription* is created.

Delegated subscription behaves the following way:

1. Listens to the event when the target field becomes registered.
1. Analyzes the resolver function once more, gathering the references props of the newly registered target field.
1. Creates a subscription for the changes of the gathered props.
1. Removes the delegated subscription.

To illustrate this, consider the next scenario:

```jsx
<Input
  name="fieldOne"
  initialValue="foo" />
<Input
  name="fieldTwo"
  required={({ fields }) => {
    const fieldOneFilled = fields.fieldOne && !!fields.fieldOne.value;
    const fieldThreeFilled = fields.fieldThree && !!fields.fieldThree.value;
  }}>
<Input
  name="fieldThree"
  initialValue="doe">
```

`fieldTwo` has the reactive prop `required`, which depends on `fieldOne.value` and `fieldThree.value`. By the time its resolver is created, `fieldThree` is not even mounted in the form. That is the point where the delegated subscription is created, awaiting for the `fieldThree`. Once the latter is mounted, the value of `fieldTwo.required` is resolved into `true`, since both target fields have their values set.