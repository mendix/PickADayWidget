# PickADayWidget

This is a date picker for Mendix. It add support for inline editing of a date (DOM-structure is different from the normal Mendix date picker)

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://docs.mendix.com/howto50/contributing-to-a-github-repository).

## Dependencies

- [Pikaday](https://github.com/dbushell/Pikaday), modified version. MIT & BSD License.
- [Momentjs](momentjs.com) 2.17.1. MIT License

## Features

This is a Mendix implementation of the Pikaday library

## Configuration

### Data Source

#### Date Attribute
Attribute. Should be of type `DateTime`.

#### Date format
This is the date format that the widget uses (formatting comes from Moment.js). Note: this is different from the placeholder used in Appearance.

### Appearance

#### Show button
Show a button next to the text-field.

#### Button Class
Glyphicon button class. The icon has class "glyphicon glyphicon-" and this class name.

#### Placeholder
Placeholder text used in the input field.

#### Show days outside month
Show the days that are within a week but outside the current month.

#### Show label
Show a label in front of the input field.

#### Label text
Text for the label.

#### Prev month button
Glyphicon button class. The icon has class "glyphicon glyphicon-" and this class Name. If you leave this empty it will use the standard buttons that are defined in the CSS file.

#### Next month button
Glyphicon button class. The icon has class "glyphicon glyphicon-" and this class Name. If you leave this empty it will use the standard buttons that are defined in the CSS file.

### Behavior

##### On Change Microflow
The microflow to execute on when the value is changed.

##### Click outside month
Make dates outside the current month clickable.

##### Trigger on focus
Keep this on false if you are using a button. This will prevent unwanted opening of the calendar when the input field gets it's focus. This can be annoying when for example using an on change microflow.

##### Disable weekend days
Disable the selection of weekend days (Saturday and Sunday).

## License

This project is licensed under the Apache License v2 (for details, see the [LICENSE](LICENSE) file).
