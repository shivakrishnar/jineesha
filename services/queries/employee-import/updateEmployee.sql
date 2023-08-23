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
declare @dMaxDate			datetime
declare @cStatus			int
select @cStatus = 1

	  select row_number() over(order by (select 0)) as Row_Num, * 
		into #CSVtable
		from string_split(@cCSVRow, ',') 

	  select @cEmployeeCode = value from #CSVtable where Row_Num = 1
	  select @nEmployeeID = ID from Employee where EmployeeCode = @cEmployeeCode and CompanyID = @nCompanyId
	  select @dMaxDate = max(EffectiveDate) from EmployeePositionOrganization where EmployeeID = @nEmployeeID

	  begin transaction

	  select @cDataValue = value from #CSVtable where Row_Num = 2
	  if len(trim(@cDataValue)) > 0
		update Employee set BirthDate = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 3
	  if len(trim(@cDataValue)) > 0
		update Employee set ClockNumber = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 4
	  if len(trim(@cDataValue)) > 0
		update Employee set EmailAddress = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 5
	  if len(trim(@cDataValue)) > 0
		update Employee set PhoneHome = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 6
	  if len(trim(@cDataValue)) > 0
		update Employee set PhoneWork = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 7
	  if len(trim(@cDataValue)) > 0
		update Employee set PhoneCell = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 8
	  if len(trim(@cDataValue)) > 0
		update Employee set GenderTypeID = (select ID from GenderType where CompanyID = @nCompanyId and EmployeeCode = @cEmployeeCode and @cDataValue = str(ID,2))
		where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 9
	  if len(trim(@cDataValue)) > 0
		update Employee set EthnicityTypeID = (select ID from EthnicityType where CompanyID = @nCompanyId and (@cDataValue = str(ID,2) or @cDataValue = Code or @cDataValue = Description))
			where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 10
	  if len(trim(@cDataValue)) > 0
		update Employee set EducationLevelTypeID = (select ID from EducationLevelType where CompanyID = @nCompanyId and (@cDataValue = str(ID,2) or @cDataValue = Code or @cDataValue = Description))
			where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 11
	  if len(trim(@cDataValue)) > 0
		update Employee set IsSmoker = case when @cDataValue = 'N' then 0 else 1 end where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 12
	  if len(trim(@cDataValue)) > 0
		update Employee set IsDisabled = case when @cDataValue = 'N' then 0 else 1 end where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 13
	  if len(trim(@cDataValue)) > 0
		update Employee set VetStatus_MilitaryReserve = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 14
	  if len(trim(@cDataValue)) > 0
		update Employee set VetStatus_Veteran = @cDataValue	where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 15
	  if len(trim(@cDataValue)) > 0
		update Employee set UD_Memo1 = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 16
	  if len(trim(@cDataValue)) > 0
		update Employee set UD_Memo2 = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 17
	  if len(trim(@cDataValue)) > 0
		update Employee set UD_Memo3 = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 18
	  if len(trim(@cDataValue)) > 0
		update Employee set FrequencyTypeID_EVO = (select ID from FrequencyType where CompanyID = @nCompanyId and (@cDataValue = str(ID,2) or @cDataValue = Code or @cDataValue = Description))
			where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 19
	  if len(trim(@cDataValue)) > 0
		update Employee set StandardPayrollHours_EVO = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 20
	  if len(trim(@cDataValue)) > 0
		update Employee set FLSAClassification_EVO = @cDataValue where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 21
	  if len(trim(@cDataValue)) > 0
	  begin
		update Employee set CurrentPositionTypeID = (select ID from PositionType where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Title))
			where EmployeeCode = @cEmployeeCode and CompanyID = @nCompanyId
		update EmployeePositionOrganization set PositionTypeID = (select ID from PositionType where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Title))
			where EmployeeID = @nEmployeeID and EffectiveDate = @dMaxDate
	  end

	  select @cDataValue = value from #CSVtable where Row_Num = 22
	  if len(trim(@cDataValue)) > 0
	  begin
		update Employee set CurrentSupervisor1ID = @cDataValue where ID = @nEmployeeID
		update EmployeePositionOrganization set Supervisor1ID = @cDataValue where EmployeeID = @nEmployeeID and EffectiveDate = @dMaxDate
	  end

	  select @cDataValue = value from #CSVtable where Row_Num = 23
	  if len(trim(@cDataValue)) > 0
	  begin
		update Employee set CurrentSupervisor2ID = @cDataValue where ID = @nEmployeeID
		update EmployeePositionOrganization set Supervisor2ID = @cDataValue where EmployeeID = @nEmployeeID and EffectiveDate = @dMaxDate
	  end

	  select @cDataValue = value from #CSVtable where Row_Num = 24
	  if len(trim(@cDataValue)) > 0
	  begin
		update Employee set CurrentSupervisor3ID = @cDataValue where ID = @nEmployeeID
		update EmployeePositionOrganization set Supervisor3ID = @cDataValue where EmployeeID = @nEmployeeID and EffectiveDate = @dMaxDate
	  end

	  select @cDataValue = value from #CSVtable where Row_Num = 25
		update EmployeePositionOrganization set AlternateSupervisor = @cDataValue where EmployeeID = @nEmployeeID and EffectiveDate = @dMaxDate

	  select @cDataValue = value from #CSVtable where Row_Num = 26
	  if len(trim(@cDataValue)) > 0
		update EmployeePositionOrganization set BenefitClassID = (select ID from BenefitClass where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description))
			where ID = @nEmployeeID

	  select @cDataValue = value from #CSVtable where Row_Num = 27
	  if len(trim(@cDataValue)) > 0
	  begin
		update Employee set CurrentEEOTypeID = (select ID from EEOType where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description))
			where ID = @nEmployeeID
		update EmployeePositionOrganization set EEOTypeID = (select ID from EEOType where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description)) 
			where EmployeeID = @nEmployeeID and EffectiveDate = @dMaxDate
	  end

	  select @cDataValue = value from #CSVtable where Row_Num = 28
	  if len(trim(@cDataValue)) > 0
	  begin
		update Employee set CurrentWorkerCompTypeID = (select ID from WorkerCompType where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description))
			where EmployeeCode = @cEmployeeCode and CompanyID = @nCompanyId
		update EmployeePositionOrganization set WorkerCompTypeID = (select ID from WorkerCompType where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description))
			where ID = @nEmployeeID --does EPO
	  end

	  select @cDataValue = value from #CSVtable where Row_Num = 29
	  if len(trim(@cDataValue)) > 0
	  begin
		update Employee set CurrentPositionOrganizationChangeReasonID = (select ID from PositionOrganizationChangeReason where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description))
			where ID = @nEmployeeID
		update EmployeePositionOrganization set PositionOrganizationChangeReasonID = (select ID from PositionOrganizationChangeReason where CompanyID = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description)) 
			where EmployeeID = @nEmployeeID and EffectiveDate = @dMaxDate
	  end

	  select @cDataValue = value from #CSVtable where Row_Num = 30
	  if len(trim(@cDataValue)) > 0
		update EmployeePositionOrganization set Comment = @cDataValue where EmployeeID = @nEmployeeID and EffectiveDate = @dMaxDate

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
			select @cStatus = 1
			update DataImportEventDetail 
				set CSVRowStatus = 'Processed', CSVRowNotes = 'Update Processed', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_ADU_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end
