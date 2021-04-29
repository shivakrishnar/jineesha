update
    dbo.HRnextUser
set
    PR_Integration_PK = '@ssoId'
where
    ID = @userId