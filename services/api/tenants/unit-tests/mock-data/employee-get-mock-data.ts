export const tenantId = 'c807d7f9-b391-4525-ac0e-31dbc0cf202b';
export const employeeId = '42242';
export const companyId = '600424';
export const roles = ['global.admin', 'hr.persona.user'];
export const email = 'wsobchak@sharklasers.com';
export const accessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpc3lzdGVtc2xsYyIsInN1YiI6ImVtcGxveWVlQHNoYXJrbGFzZXJzLmNvbSIsImFwcGxpY2F0aW9uSWQiOiIyM2U2OWRkZS0yMjYwLTRkZWYtOTAzMi0wODM2MDQzNWUyMTAiLCJhY2NvdW50Ijp7Im1vZGlmaWVkQXQiOiIyMDE4LTExLTA4VDE5OjI0OjQ1Ljk4OVoiLCJ0ZW5hbnRJZCI6ImM4MDdkN2Y5LWIzOTEtNDUyNS1hYzBlLTMxZGJjMGNmMjAyYiIsImNyZWF0ZWRBdCI6IjIwMTgtMDctMjZUMTY6MjE6MzYuMTgzWiIsImNsaWVudHMiOltdLCJlbWFpbCI6ImVtcGxveWVlQHNoYXJrbGFzZXJzLmNvbSIsImNyZWF0ZWRCeSI6eyJpZCI6ImFiNWE2YjNlLWJlMjQtNDRlNS1hMTVmLTAwMDNjY2FkYTc1NCIsInVzZXJuYW1lIjoiZGVtbyJ9LCJlbmFibGVkIjp0cnVlLCJzdXJuYW1lIjoiQmFydG93c2tpIiwidXNlcm5hbWUiOiJlbXBsb3llZUBzaGFya2xhc2Vycy5jb20iLCJpZCI6ImExNGE3YzMzLWJmZDEtNDJmYi05ODE0LWU4YzE4NGYzNTk3OSIsImdpdmVuTmFtZSI6IkNoYXJsZXMiLCJtb2RpZmllZEJ5Ijp7ImlkIjoiYWI1YTZiM2UtYmUyNC00NGU1LWExNWYtMDAwM2NjYWRhNzU0IiwidXNlcm5hbWUiOiJkZW1vIn0sImhyZWYiOiJodHRwczovL2FwaXN0YWdpbmcuZXZvbHV0aW9uLXNvZnR3YXJlLmNvbS9pZGVudGl0eS90ZW5hbnRzL2M4MDdkN2Y5LWIzOTEtNDUyNS1hYzBlLTMxZGJjMGNmMjAyYi9hY2NvdW50cy9hMTRhN2MzMy1iZmQxLTQyZmItOTgxNC1lOGMxODRmMzU5NzkiLCJoYW5rZXkiOiIyOTU2YzcxMjk4OTQyZDJkYWUyMWE4ZTZhMzBkNWUxMSRkOWNmYTQ4Y2Q1YjgyNjVkZTkwNTkxZjcwZGFlNGE5MiQ5OGQ2MDUwYzU5ZGI5YTU4NzliNDFkOGQ4YjJmM2IxNzU3NjBjY2M3OGNkZDJiZjlkMzA1ZjlkMzFmZDM4Nzk5In0sInNjb3BlIjpbXSwianRpIjoiNTJiZDFhMWEtOTgxMS00NmJiLTlkMjQtNjI1MWU5ZGI4MzA3IiwiaWF0IjoxNTQ2MDIzOTgxLCJleHAiOjE1NDYwMjc1ODF9.M9cphp3ORHP_J-r4CsIbKxDug6w_WaZFjpW0bdGKfak';

export const employeeInfoDBResponse = {
    recordset: [
        {
            ID: '12345',
            FirstName: 'Walter',
            LastName: 'Sobchak',
            EmployeeCode: '422',
            CompanyName: 'Lebowski Inc.',
            IsSalary: true,
            evoData: {
                clientId: undefined,
                companyId: undefined,
                employeeId: undefined,
            },
        },
    ],
    output: {},
    rowsAffected: [0],
};

export const employeeMockResult = {
    id: '12345',
    firstName: 'Walter',
    lastName: 'Sobchak',
    eeCode: '422',
    companyName: 'Lebowski Inc.',
    isSalary: true,
    evoData: {
        clientId: undefined,
        companyId: undefined,
        employeeId: undefined,
    },
};
