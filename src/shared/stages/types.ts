export interface TextAnswerTheme {
    container?: string;       // outer div
    title?: string;           // h2
    promptText?: string;      // prompt paragraph
    input?: string;           // text input
    submitButton?: string;    // submit button
    errorText?: string;       // error p tag
    imageWrapper?: string;    // img className
}

export interface PinAnswerTheme {
    container?: string;       // outer div
    title?: string;           // h2
    promptText?: string;      // prompt paragraph
    dotFilled?: string;       // filled dot span
    dotEmpty?: string;        // empty dot span
    shakeAnimation?: string;  // class applied on wrong pin
    pinButton?: string;       // PinPad buttonClassName
}

export interface FillWordsTheme {
    container?: string;       // outer div
    title?: string;           // h2
    wordGap?: string;         // className for space between words
    trailingPunctuation?: string; // className for trailing punctuation spans
}

export interface WelcomeTheme {
    container?: string;
    title?: string;
    subtitle?: string;
    button?: string;
}

export interface CongratsTheme {
    container?: string;
    title?: string;
    subtitle?: string;
}

export interface CrossclimbTheme {
    container?: string;
    title?: string;
    description?: string;
    hintText?: string;
    rowContainer?: string;
    clueText?: string;
    inputContainer?: string;
}

export interface PinpointTheme {
    container?: string;
    title?: string;
    clueList?: string;
    clueItem?: string;
    input?: string;
    submitButton?: string;
}
