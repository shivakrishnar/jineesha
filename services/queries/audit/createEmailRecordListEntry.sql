insert into dbo.EmailRecord
(
    CompanyID,
    OriginAddress,
    EmailString,
    AddressList,
    DateTimeSent,
    Subject
) values (
    @companyId,
    '@originAddress',
    '@emailString',
    '@addressList',
    '@dateTimeSent',
    '@subject'
)
