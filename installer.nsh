!macro customInstall
  ; Register file associations for log files
  WriteRegStr HKCR ".log" "" "LogViewer.LogFile"
  WriteRegStr HKCR "LogViewer.LogFile" "" "Log Viewer File"
  WriteRegStr HKCR "LogViewer.LogFile\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE},0"
  WriteRegStr HKCR "LogViewer.LogFile\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'
  
  ; Register for .txt files
  WriteRegStr HKCR ".txt" "" "LogViewer.TextFile"
  WriteRegStr HKCR "LogViewer.TextFile" "" "Log Viewer Text File"
  WriteRegStr HKCR "LogViewer.TextFile\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE},0"
  WriteRegStr HKCR "LogViewer.TextFile\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'
  
  ; Register for other text files
  WriteRegStr HKCR ".json" "" "LogViewer.JsonFile"
  WriteRegStr HKCR "LogViewer.JsonFile" "" "Log Viewer JSON File"
  WriteRegStr HKCR "LogViewer.JsonFile\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE},0"
  WriteRegStr HKCR "LogViewer.JsonFile\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'
  
  WriteRegStr HKCR ".xml" "" "LogViewer.XmlFile"
  WriteRegStr HKCR "LogViewer.XmlFile" "" "Log Viewer XML File"
  WriteRegStr HKCR "LogViewer.XmlFile\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE},0"
  WriteRegStr HKCR "LogViewer.XmlFile\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'
  
  WriteRegStr HKCR ".csv" "" "LogViewer.CsvFile"
  WriteRegStr HKCR "LogViewer.CsvFile" "" "Log Viewer CSV File"
  WriteRegStr HKCR "LogViewer.CsvFile\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE},0"
  WriteRegStr HKCR "LogViewer.CsvFile\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'
  
  ; Add "Open with Log Viewer" to context menu
  WriteRegStr HKCR "*\shell\OpenWithLogViewer" "" "Open with Log Viewer"
  WriteRegStr HKCR "*\shell\OpenWithLogViewer\command" "" '"$INSTDIR\${APP_EXECUTABLE}" "%1"'
  
  ; Refresh shell
  System::Call 'Shell32::SHChangeNotify(i ${SHCNE_ASSOCCHANGED}, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  ; Remove file associations
  DeleteRegKey HKCR ".log"
  DeleteRegKey HKCR "LogViewer.LogFile"
  DeleteRegKey HKCR ".txt"
  DeleteRegKey HKCR "LogViewer.TextFile"
  DeleteRegKey HKCR ".json"
  DeleteRegKey HKCR "LogViewer.JsonFile"
  DeleteRegKey HKCR ".xml"
  DeleteRegKey HKCR "LogViewer.XmlFile"
  DeleteRegKey HKCR ".csv"
  DeleteRegKey HKCR "LogViewer.CsvFile"
  DeleteRegKey HKCR "*\shell\OpenWithLogViewer"
  
  ; Refresh shell
  System::Call 'Shell32::SHChangeNotify(i ${SHCNE_ASSOCCHANGED}, i 0, i 0, i 0)'
!macroend