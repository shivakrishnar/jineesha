set nocount on

declare @cTenantId				nvarchar(50)    = @TenantId
declare @nCompanyId				bigint          = @CompanyId
declare @nRowNumber				int             = @RowNumber + 1
declare @nDataImportEventId     bigint          = @DataImportEventId
declare @cCSVRow                nvarchar(max)   = @CsvRow

declare @nNbrDelimiters		int
declare @cErrorMessage		varchar(200)
select  @cErrorMessage = ''
declare @nGlobalError_Nbr	tinyint
select  @nGlobalError_Nbr = 0
declare @cDataValue			nvarchar(200)
declare @cColumnsToUpdate	varchar(50)
select  @cColumnsToUpdate = ''
declare @cStatus			int
select  @cStatus = 1

	  select @nNbrDelimiters = len(@cCSVRow)-len(replace(@cCSVRow,',',''))

	  if @nNbrDelimiters < 29
		begin
			select @cErrorMessage = @cErrorMessage + 'Invalid number of columns - Too few,', @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
			return
		end
	  if @nNbrDelimiters > 29
		begin
			select @cErrorMessage = @cErrorMessage + 'Invalid number of columns - Too many,', @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
			return
		end

	  select row_number() over(order by (select 0)) as Row_Num, * 
		into #CSVtable
		from string_split(@cCSVRow, ',') 

	  select @cDataValue = value from #CSVtable where Row_Num = 1 
	  if len(trim(@cDataValue)) = 0 or (select count(EmployeeCode) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
		begin
			select @cErrorMessage = @cErrorMessage + 'Incorrect Employee Identifier,', @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
			return
		end

	  select @cDataValue = value from #CSVtable where Row_Num = 2
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if isdate(@cDataValue) = 0 or cast(@cDataValue as date) > getdate()
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid BirthDate,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
				begin
					update DataImportEventDetail 
						set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
						where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
					select @cStatus as StatusResult
					return
				end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 3 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if isnumeric(@cDataValue) = 0  
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Time Clock Number,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 4 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) < 10 or @cDataValue not like '%@%'
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid eMail,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 5 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' and 
		   @cDataValue not like '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '([0-9][0-9][0-9])[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '[0-9][0-9][0-9].[0-9][0-9][0-9].[0-9][0-9][0-9][0-9]' 
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Home Phone,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 6 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' and 
		   @cDataValue not like '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '([0-9][0-9][0-9])[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '[0-9][0-9][0-9].[0-9][0-9][0-9].[0-9][0-9][0-9][0-9]' --or  
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Work Phone,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 7 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' and 
		   @cDataValue not like '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '([0-9][0-9][0-9])[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '[0-9][0-9][0-9].[0-9][0-9][0-9].[0-9][0-9][0-9][0-9]' --or
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Cell Phone,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 8 
	  if @cDataValue not in (select Code from GenderType) or 
		 len(trim(@cDataValue)) = 0
		 begin
			select @cErrorMessage = @cErrorMessage + 'Invalid Gender,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
			if @nGlobalError_Nbr = 5
				begin
					update DataImportEventDetail 
						set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
						where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
					select @cStatus as StatusResult
					return
				end
		 end
	  else
		 select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 9 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select str(ID,2) from EthnicityType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from EthnicityType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from EthnicityType where CompanyID = @nCompanyId)
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Ethnicity,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 10
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select str(ID,1) from EducationLevelType) and 
		   @cDataValue not in (select Code from EducationLevelType) and 
		   @cDataValue not in (select isnull(Description,'') from EducationLevelType)
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Education Level,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 11
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not between 0 and 1
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Tobacco User,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 12
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not between 0 and 1
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Disabled,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 13 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in ('Declined to disclose - N/A' , 'No' , 'Yes')
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Military Reserve,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 14 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in ('Declined to disclose - N/A' , 'No' , 'Yes')
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Veteran,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 15 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 100 
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Memo1,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 16 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 100 
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Memo2,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 17 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 100 
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Memo3,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 18 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,3)) from FrequencyType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from FrequencyType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from FrequencyType where CompanyID = @nCompanyId)
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Pay Frequency,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 19 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if cast(@cDataValue as decimal(14,6)) not between 1 and 2080
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Standard Payroll Hours,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 20
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in ('E','N','NA')
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid FLSA Classification,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 21
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,3)) from PositionType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from PositionType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Title from PositionType where CompanyID = @nCompanyId)
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Position,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 22
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select count(EmployeeCode) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Reports To 1,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 23
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select count(EmployeeCode) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Reports To 2,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 24
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select count(EmployeeCode) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Reports To 3,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 25
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if isnumeric(@cDataValue) = 0
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Supervisor(SC),', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 26
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,2)) from BenefitClass where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from BenefitClass where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from BenefitClass where CompanyID = @nCompanyId)
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Benefit Class/Eligibility Group,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 27
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,2)) from EEOType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from EEOType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from EEOType where CompanyID = @nCompanyId)
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid EEO Category,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 28
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select count(ID) from WorkerCompType 
			where 
				Code = (left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1)) and 
				CountryStateTypeID = (select ID from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')) and 
				CompanyID = @nCompanyId) <> 1
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Worker Comp Code,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 29
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,3)) from PositionOrganizationChangeReason where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from PositionOrganizationChangeReason where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from PositionOrganizationChangeReason where CompanyID = @nCompanyId)  
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Change Reason,', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	  select @cDataValue = value from #CSVtable where Row_Num = 30
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 4000
			begin
				select @cErrorMessage = @cErrorMessage + 'Invalid Comment', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
				if @nGlobalError_Nbr = 5
					begin
						update DataImportEventDetail 
							set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
							where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
						select @cStatus as StatusResult
						return
					end
			end
		else
			select @cColumnsToUpdate = @cColumnsToUpdate + 'Y'

	if @nGlobalError_Nbr > 0
		begin
			select @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end
	else
		begin
			select @cStatus = 1
			update DataImportEventDetail 
				set CSVRowNotes = 'Validation Passed', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end
