insert into dbo.BillingEvent (
    CompanyID,
    BillingEventTypeID,
    Date
) values (
    @companyId,
    @billingEventTypeId,
    getdate()
)