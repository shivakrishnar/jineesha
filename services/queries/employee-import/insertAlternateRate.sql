set nocount on

declare @cTenantId				nvarchar(50)    = @TenantId
declare @nCompanyId				bigint          = @CompanyId
declare @nRowNumber				int             = @RowNumber + 1
declare @nDataImportEventId     bigint          = @DataImportEventId
declare @cCSVRow                nvarchar(max)   = @CsvRow

declare @nNbrDelimiters		int
declare @cErrorMessage		varchar(200)
select @cErrorMessage = ''
declare @nGlobalError_Nbr 	tinyint
select @nGlobalError_Nbr = 0
declare @cDataValue			nvarchar(200)
declare @cEmployeeCode		nvarchar(50)
declare @nEmployeeID		bigint
declare @nMaxAltRateID		bigint
declare @cStatus			int = 1

--declares for columns to insert
 declare @dStartDate			datetime
 declare @dEndDate				datetime
 declare @nRateNumber			bigint
 declare @nHourlyRate			decimal(14,6)
 declare @nPositionTypeID		bigint
 declare @nWorkerCompTypeID		bigint
 declare @nOrg1ID				bigint
 declare @nOrg2ID				bigint
 declare @nOrg3ID				bigint
 declare @nOrg4ID				bigint
 declare @alternaterateId 		int = SCOPE_IDENTITY()

	  select row_number() over(order by (select 0)) as Row_Num, * 
		into #CSVtable
		from string_split(replace(substring(@cCSVRow,2,len(@cCSVRow)-2), '","','~'), '~')

	  select @cEmployeeCode = value from #CSVtable where Row_Num = 1
	  select @nEmployeeID = ID from Employee where EmployeeCode = @cEmployeeCode and CompanyID = @nCompanyId
	  select @nMaxAltRateID = max(ID) from EmployeeAlternateRate where EmployeeID = @nEmployeeID

	  begin transaction
	  -----------
	  select @cDataValue = value from #CSVtable where Row_Num = 2
		select @nRateNumber = @cDataValue 

	  select @cDataValue = value from #CSVtable where Row_Num = 3
		select @dStartDate = @cDataValue 

	  select @cDataValue = value from #CSVtable where Row_Num = 4
		select @dEndDate = @cDataValue 

	  select @cDataValue = value from #CSVtable where Row_Num = 5
		select @nHourlyRate = @cDataValue 

	  select @cDataValue = value from #CSVtable where Row_Num = 6
		select @nPositionTypeID = (select top 1 ID from PositionType where companyid = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Title))

	  select @cDataValue = value from #CSVtable where Row_Num = 7
	  	if len(trim(@cDataValue)) > 0
			select @nWorkerCompTypeID = (select ID from WorkerCompType where Code = (left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1)) and 
				   CountryStateTypeID = (select ID from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')) and CompanyID = @nCompanyId)

	  select @cDataValue = value from #CSVtable where Row_Num = 8
	  	if len(trim(@cDataValue)) > 0
			select @nOrg1ID = (select OT.ID
							   from OrganizationType OT 
										join OrganizationStructure OS on OS.ID = OT.OrganizationStructureID
							   where OS.CompanyID = @nCompanyId and OrgLevel = 1 and 
									 OT.Code = left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1) and
									 OT.HomeStateID = (select id from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')))

	  select @cDataValue = value from #CSVtable where Row_Num = 9
	  	if len(trim(@cDataValue)) > 0
			select @nOrg2ID = (select OT.ID
							   from OrganizationType OT 
										join OrganizationStructure OS on OS.ID = OT.OrganizationStructureID
							   where OS.CompanyID = @nCompanyId and OrgLevel = 2 and OT.Org1ParentID = @nOrg1ID and 
									 OT.Code = left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1) and
									 OT.HomeStateID = (select id from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')))

	  select @cDataValue = value from #CSVtable where Row_Num = 10
	  	if len(trim(@cDataValue)) > 0
			select @nOrg3ID = (select OT.ID
							   from OrganizationType OT 
										join OrganizationStructure OS on OS.ID = OT.OrganizationStructureID
							   where OS.CompanyID = @nCompanyId and OrgLevel = 3 and OT.Org2ParentID = @nOrg2ID and 
									 OT.Code = left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1) and
									 OT.HomeStateID = (select id from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')))

	  select @cDataValue = value from #CSVtable where Row_Num = 11
	  	if len(trim(@cDataValue)) > 0
			select @nOrg4ID = (select OT.ID
							   from OrganizationType OT 
										join OrganizationStructure OS on OS.ID = OT.OrganizationStructureID
							   where OS.CompanyID = @nCompanyId and OrgLevel = 4 and OT.Org3ParentID = @nOrg3ID and 
									 OT.Code = left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1) and
									 OT.HomeStateID = (select id from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')))

	  --this is to ensure that the previous AlternateRate record for the employee has an appropriate end date
	 update EmployeeAlternateRate set EndDate = @dStartDate - 1 where EmployeeID = @nEmployeeID and ID = @nMaxAltRateID

	 insert into EmployeeAlternateRate (EmployeeID, StartDate, EndDate, HourlyRate, PositionTypeID, WorkerCompTypeID, Org1ID, Org2ID, Org3ID, Org4ID, RateNumber_EVO)
	 values (@nEmployeeID, @dStartDate, @dEndDate, @nHourlyRate, @nPositionTypeID, @nWorkerCompTypeID, @nOrg1ID, @nOrg2ID, @nOrg3ID, @nOrg4ID, @nRateNumber)

    if @@error <> 0
        select @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	if @nGlobalError_Nbr > 0
		begin
			rollback transaction
			select @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = 'Update Failed', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_ADU_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end
	else
		begin
			commit transaction
			select @cStatus = 1, @alternaterateId = SCOPE_IDENTITY()
			update DataImportEventDetail 
				set CSVRowStatus = 'Processed', CSVRowNotes = 'Update Processed', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_ADU_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult, @alternaterateId as AlternateRateIdResult
		end
