import { ParameterizedQuery } from '../parameterizedQuery';

describe('ParameterizedQuery.setStringParameter', () => {
    let query: ParameterizedQuery;
    const internalData = '\ndata that should not be altered at any point\n @par @quote these should be untouched\n';
    beforeEach(() => {
        query = new ParameterizedQuery('test', `@param${internalData}'@quotedParam'`);
    });

    test('Sets params based on an unquoted string', () => {
        const testString = 'Success';
        const expectedResult: string = `'${testString}'` + internalData + `'${testString}'`;
        query.setStringParameter('@param', testString);
        query.setStringParameter('@quotedParam', testString);
        return expect(query.value).toBe(expectedResult);
    });
    test('Sets params based on a quoted string', () => {
        const testString = "'Success'";
        const expectedResult: string = testString + internalData + `''${testString}''`;
        query.setStringParameter('@param', testString);
        query.setStringParameter('@quotedParam', testString);
        return expect(query.value).toBe(expectedResult);
    });
    test('Sets params based on a string containing quotes', () => {
        const testString = "S''uc''''c'''e's'''s'''''";
        const escapedTestString = "S''''uc''''''''c''''''e''s''''''s''''''''''";
        const expectedResult: string = `'${escapedTestString}'` + internalData + `'${escapedTestString}'`;
        query.setStringParameter('@param', testString);
        query.setStringParameter('@quotedParam', testString);
        return expect(query.value).toBe(expectedResult);
    });
    test('Sets params based on a quoted string containing quotes', () => {
        const testString = "''Su'''cc'''''e''ss''''";
        const escapedTestString = "''''Su''''''cc''''''''''e''''ss''''''''";
        const expectedResult: string = "'''Su''''''cc''''''''''e''''ss'''''''" + internalData + `'${escapedTestString}'`;
        query.setStringParameter('@param', testString);
        query.setStringParameter('@quotedParam', testString);
        return expect(query.value).toBe(expectedResult);
    });
    test('Sets params based on an unquoted string containing a variety of characters', () => {
        const testString =
            '!@#$%^&*()_+~`hw        ttoguuwvc,dhoohs27930oiehldfxcnvbm,?><MNHY\n\n&*(8765rfc   vbkjhgfr567*&^%ESDFGHNBCDE#$%^&898765ry3kmnefvfh65tr4;nros';
        const expectedResult: string = `'${testString}'` + internalData + `'${testString}'`;
        query.setStringParameter('@param', testString);
        query.setStringParameter('@quotedParam', testString);
        return expect(query.value).toBe(expectedResult);
    });
});
