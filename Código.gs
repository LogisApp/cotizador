var rutaWeb = ScriptApp.getService().getUrl();

function getVendedor(vendedor)
{
  var tmail=''
  var user
  if (vendedor == null)
  {
    tmail=getEmail();
    user = sheet.filter(function (row) {
      return row[3] == tmail 
    })[0];
  }
  else
  {
    user = sheet.filter(function (row) {
      return row[7] == vendedor 
    })[0];
Logger.log(user)
    tmail=user==null ? '' : user[3];
  }
  var objvendedor={"mail" : tmail ,"codvendedor" : user[7], "nombre" : user[4]+' '+user[5],"rol" : user[6],"error" : '',"jefe" : user[13],"sucursal": user[8]}
Logger.log(objvendedor)
  return objvendedor; 
}

function doGet(e)
{
  var page = e.parameter.p || 'GestionVtas'  ////   || "Auditor_Pedidos";  // (p) es el parametro que direcciona a la pagina
  var ven  = e.parameter.v                                // (v) es el parametro del vendedor
  var rol  = e.parameter.r || 'op'                        // (r) es el parametro del rol , {op}erador(cartera),{ve}ndedor(ventas),{di}rector(todo),{ad}ministrador(todo)
  //var page = e.parameter.p || "xxpruebas";
//  if ((!page || page.trim() == "" || !ven || ven.trim() == "") && page == 'Pedidos') // Valida que se envien parametros
  if (!page  &&  !rol) // Valida que se envien parametros
  {
    return HtmlService.createHtmlOutput("<h1><center>El parámetro no está presente o está vacío.</h1>");
  }
  var template =HtmlService.createTemplateFromFile(page)
  template.e=e
  return template.evaluate() // El evaluate siempre debe estar antes del FrameOptions
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) { 
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getPage(page){
  var html = HtmlService.createHtmlOutputFromFile(page).getContent();
  return [html, page]
}

function getUrl(){
  return ScriptApp.getService().getUrl();
}

function getDataSql(sql)
{
//  var sql='select * from cempresa'
  var m1=RequestAPI({'query':sql}); 
  Logger.log('Louis:');
  Logger.log(m1);
  if (m1 != null) 
  {
    var camposd=Array(Object.values(m1));
    var campos=camposd[0];
  //  Logger.log(campos);
  //  Logger.log(campos[1].nit + campos[1].nombre);
  }
  else
  {
    campos={}
  }
  return campos
}

function putDataSql(sql) 
{
  Logger.log(sql)
  //Parámetros para llamar a la API
  var endpoint = 'http://190.0.29.186:8114/louis/webservices3.php';  // Informix
//    var endpoint = 'http://190.0.29.186:8114/louis/webservices2.php';  // Sql
//    var yendpoint = 'http://appweb.eastus2.cloudapp.azure.com:23080/webservices2.php'; // Ofima Web
    // parametros para sacar los datos de la URL
  // parametros para sacar los datos de la URL
  var options = {
  'method' : 'post',
  'payload' : sql
  };
  
  try 
  {
    // llamada a la API
    var response = UrlFetchApp.fetch(endpoint, options);
    var data = response.getContentText();
    Logger.log(data);
  }
  catch (error) 
  {
    // mira si hay errores
    Logger.log(error);
  };
}


function pruebas()
{
  var sql=`select g.id_general,g.cliente,c.nombre,c.codvendedor,g.fecha_ini,g.fecha_fin,g.id_seguimiento,s.detalle as detalle_seg,g.id_asunto,a.detalle as detalle_asu,g.id_razon,r.detalle as detalle_raz,case when g.estado='I' then 'Inicio' else case when g.estado='P' then 'Proceso' else 'Cerrado' end end as estado,(select count(*) from invcxc:wf_detalle d where d.id_general=g.id_general) as veces,invcxc:f_wf_observacion(g.cliente) as observacion
        ,(select max(fecha) from invcxc:wf_detalle d where d.id_general=g.id_general) as ultima
            from invcxc:wf_general g
            left join invcxc:wf_seguimiento s on s.id_seguimiento=g.id_seguimiento
            left join invcxc:wf_asunto a on a.id_asunto=g.id_asunto
            left join invcxc:wf_razon r on r.id_razon=g.id_razon
            left join invcxc:clientes c on c.codigo=g.cliente
            left join invcxc:vendedores v on v.codvendedor=c.codvendedor
            where  estado<>'C' and c.codvendedor='07' and g.cliente='M8427'
            --and year(g.fecha_ini)>=year(current) 
            order by fecha_ini`
  var m1=RequestAPI({'query':sql}); 
  Logger.log('Louis:');
  Logger.log(m1);
  var camposd=Array(Object.values(m1));
  var campos=camposd[0];
  Logger.log(campos)
}

function RequestAPI(m) 
{
//Logger.log('Request-----')
//Logger.log(m)
  var sql= m['query']
//Logger.log(sql)
    if (typeof sql === "undefined") return false // OVERLOAD DISABLED
    //Parámetros para llamar a la API
    var endpoint = 'http://190.0.29.186:8114/louis/webservices3.php';  // Informix
//    var endpoint = 'http://190.0.29.186:8114/louis/webservices2.php';  // Sql
//    var yendpoint = 'http://appweb.eastus2.cloudapp.azure.com:23080/webservices2.php'; // Ofima Web
    // parametros para sacar los datos de la URL
    var options = {
      'method' : 'post',
      'payload' : sql,
      'muteHttpExceptions':true
    };
    try {
      // llamada a la API
      console.log('RequestAPI')
      console.log(sql);
      var response = UrlFetchApp.fetch(endpoint, options);
      var data = response.getContentText();
      Logger.log(data)
      var results = JSON.parse(data);
      m['results']=results;
    }
    catch (error) { 
      Logger.log(error);
      m['results']={error} 
Logger.log('*******Error************')
    }

//Logger.log(results)
  return results
}

function Api(endpoint='https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=6.1587824&lon=-75.6189488')
{
  var options = {
    'method' : 'get',
    'muteHttpExceptions':true
  };
Logger.log('Mapa')
Logger.log(endpoint)
  try {
    // llamada a la API
    console.log('Api')
    var response = UrlFetchApp.fetch(endpoint, options);
    var data = response.getContentText();
////    var results = JSON.parse(data);
console.log(data)
  }
  catch (error) {
Logger.log('*****error****')
    Logger.log(error);
  }
  return results
}

function xjson(xfile)
{
  const data=JSON.parse(HtmlService.createHtmlOutputFromFile(xfile).getContent())
  return data
}

function getEmail() 
{
//  Logger.log('user : '+Session.getActiveUserLocale()+'/'+Session.getActiveUser()+'/'+Session.getEffectiveUser()+'/'+Session.getTemporaryActiveUserKey());
  try {
    var email = Session.getEffectiveUser().getEmail();
    return email;
  } catch (error) {
    // Manejo de la excepción
    console.error('Error al obtener la dirección de correo electrónico:', error);
    return null; // o cualquier otro valor que desees retornar en caso de error
  }
}

/*
* Async.gs
*
* Manages asyncronous execution via time-based triggers.
*
* Note that execution normally takes 30-60s due to scheduling of the trigger.
*
* @see https://developers.google.com/apps-script/reference/script/clock-trigger-builder.html
*/

var Async = Async || {};
var GLOBAL = this;

// Triggers asynchronous execution of a function (with arguments as extra parameters)
Async.call = function(handlerName) {
  return Async.apply(handlerName, Array.prototype.slice.call(arguments, 1));
};

// Triggers asynchronous execution of a function (with arguments as an array)
Async.apply = function(handlerName, args) {
  var trigger = ScriptApp
  .newTrigger('Async_handler')
  .timeBased()
  .after(1)
  .create();
  CacheService.getScriptCache().put(String(trigger.getUniqueId()), JSON.stringify({ handlerName: handlerName, args: args }));
  return { 
    triggerUid: trigger.getUniqueId(),
    source: String(trigger.getTriggerSource()), 
    eventType: String(trigger.getEventType()), 
    handlerName: handlerName,
    args: args
  };
};

// GENERIC HANDLING BELOW
// 
function Async_handler(e) {
  var triggerUid = e && e.triggerUid;
  var cache = CacheService.getScriptCache().get(triggerUid);
  if (cache) {
    try {
      var event = JSON.parse(cache);
      var handlerName = event && event.handlerName;
      var args = event && event.args;
      if (handlerName) {
        var context, fn = handlerName.split('.').reduce(function(parent, prop) {
          context = parent;
          return parent && parent[prop];
        }, GLOBAL);
        if (!fn || !fn.apply) throw "Handler `" + handlerName + "` does not exist! Exiting..";
        // Execute with arguments
        fn.apply(context, args || []);
      }
    } catch (e) {
      console.error(e);
    }
  }
  // Delete the trigger, it only needs to be executed once
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getUniqueId() === triggerUid) {
      ScriptApp.deleteTrigger(t);
    }
  });
};

function SendMail3(mail){
//   var mail={
//            'to':'Luis.Bastidas@AcerosIndustriales.Com',
//            'subject':'INFORME '+'title'+' | '+formatDate(new Date(),'yyyy/mm/dd-hh:mi'),
//            'message': 'Este mensaje fue autogenerado desde AisaCloud.\n',
//            'nameSender': sender
//          }
  if (mail.to != null && mail.to !='') MailApp.sendEmail(mail);
}

function getCarpetasSL(xsucursal,xcliente) 
{
  //https://drive.google.com/drive/folders/1H4zbij8JptnbKPgb0orLrxH3ohAfoqY_    Medellin
  //https://drive.google.com/drive/folders/1IvnnIS-TpXJPV3B5SlFKzcaMWD1dqfE7    Bogota
  try {
  if (xsucursal=='01')
    var carpetaMain=DriveApp.getFolderById('1H4zbij8JptnbKPgb0orLrxH3ohAfoqY_')
  else
    var carpetaMain=DriveApp.getFolderById('1IvnnIS-TpXJPV3B5SlFKzcaMWD1dqfE7')
  var folders=carpetaMain.getFolders()
  var regex = /\b.(GMT)\b.*\)$/;
  while (folders.hasNext()) 
  {
    var folder = folders.next();
    if (folder.getName().indexOf(xcliente) !== -1) {
//      Logger.log("Se encontró la carpeta '" + folder.getName() + "'.");
      var archivos=folder.getFiles()
      arrayFiles=[]
      var lista=0
      const regex2 = /^0[1-5]/;  // validar que inicien por 01,02,03,04,05
      var sw1 = false, sw2 = false, sw3 = false, sw4 = false, sw5 = false;
      while (archivos.hasNext())
      {
        var archivo=archivos.next()
//Logger.log(archivo)
        if (regex2.test(archivo.getName()) || archivo.getName().substring(0, 2).toUpperCase()==='SA')
        {
          var fecha = new Date(archivo.getLastUpdated());
          var anio = fecha.getFullYear();
          var mes = fecha.toLocaleString('default', { month: '2-digit' });
          var dia = fecha.getDate();
          var fechaFormateada = anio + '/' + mes + '/' + dia;

          var objlista={
            Id:lista,
            Nombre:archivo.getName(),
            Tamano:Math.round(archivo.getSize()/1024),
            Fecha:fechaFormateada,
            Url:archivo.getUrl()
          }
          arrayFiles.push(objlista)
          lista ++

          switch (archivo.getName().substring(0, 2).toUpperCase()) {
            case '01': 
              sw1 = true;
              break;
            case '02': 
              sw2 = true;
              break;
            case '03': 
              sw3 = true;
              break;
            case '04': 
              sw4 = true;
              break;
            case 'SA': 
              sw5 = true;
              break;
          }
      
        }
      }

      if (!sw1)
      {
        var objlista={
          Nombre:'01-*****sagrilaft',
          Fecha:'',
          Tamano:''
        }
        arrayFiles.push(objlista)
      }
      if (!sw2)
      {
        var objlista={
          Nombre:'02-*****rut',
          Fecha:'',
          Tamano:''
        }
        arrayFiles.push(objlista)
      }
      if (!sw3)
      {
        var objlista={
          Nombre:'03-*****camara comercio',
          Fecha:'',
          Tamano:''
        }
        arrayFiles.push(objlista)
      }
      if (!sw4)
      {
        var objlista={
          Nombre:'04-*****cedula rep legal',
          Fecha:'',
          Tamano:''
        }
        arrayFiles.push(objlista)
      }
      if (!sw5)
      {
        var objlista={
          Nombre:'  -*****sagrilaft',
          Fecha:'',
          Tamano:''
        }
        arrayFiles.push(objlista)
      }
      //ordenar por 1 criterio
      const XcompararFechas = (a, b) => {
        const fechaA = new Date(a.Fecha).getTime();
        const fechaB = new Date(b.Fecha).getTime();
        return fechaA - fechaB;
      };
      //ordernar por 2 criterios
      const compararFechas = (a, b)  =>
      {
        if (a.Fecha < b.Fecha) {
          return -1;
        } else if (a.Fecha > b.Fecha) {
          return 1;
        } else {
          if (a.Nombre < b.Nombre) {
            return -1;
          } else if (a.Nombre > b.Nombre) {
            return 1;
          } else {
            return 0;
          }
        }
      }
      const objetoOrdenado = arrayFiles.sort(compararFechas);
      return objetoOrdenado;
    }
  }
  return null;
  } catch (e) {
      console.error(e);
      return null;
  }
}

function getCarpetas(xsucursal,xcliente) {
  //https://drive.google.com/drive/folders/1CeO1JlxbkaxpnX1ifwIlG5-83rPsOR_u    Vendedores
  var carpetaMain=DriveApp.getFolderById('1CeO1JlxbkaxpnX1ifwIlG5-83rPsOR_u')
  var folders=carpetaMain.getFolders()
  var regex = /\b.(GMT)\b.*\)$/;
  while (folders.hasNext()) 
  {
    var folder = folders.next();
    if (folder.getName().indexOf(xcliente) !== -1) {
//      Logger.log("Se encontró la carpeta '" + folder.getName() + "'.");
      var archivos=folder.getFiles()
      arrayFiles=[]
      var lista=0
////      const regex2 = /^0[1-5]/;  // validar que inicien por 01,02,03,04,05
      var sw1 = false, sw2 = false, sw3 = false, sw4 = false, sw5 = false;
      while (archivos.hasNext())
      {
        var archivo=archivos.next()
//Logger.log(archivo)
////        if (regex2.test(archivo.getName()))
////        {
          var fecha = new Date(archivo.getLastUpdated());
          var anio = fecha.getFullYear();
          var mes = fecha.toLocaleString('default', { month: '2-digit' });
          var dia = fecha.getDate();
          var fechaFormateada = anio + '/' + mes + '/' + dia;

          var objlista={
            Id:lista,
            Nombre:archivo.getName(),
            Tamano:Math.round(archivo.getSize()/1024),
            Fecha:fechaFormateada,
            Url:archivo.getUrl()
          }
          arrayFiles.push(objlista)
          lista ++
     
////        }
      }

      //ordenar por 1 criterio
      const XcompararFechas = (a, b) => {
        const fechaA = new Date(a.Fecha).getTime();
        const fechaB = new Date(b.Fecha).getTime();
        return fechaA - fechaB;
      };
      //ordernar por 2 criterios
      const compararFechas = (a, b)  =>
      {
        if (a.Fecha < b.Fecha) {
          return -1;
        } else if (a.Fecha > b.Fecha) {
          return 1;
        } else {
          if (a.Nombre < b.Nombre) {
            return -1;
          } else if (a.Nombre > b.Nombre) {
            return 1;
          } else {
            return 0;
          }
        }
      }
      const objetoOrdenado = arrayFiles.sort(compararFechas);
      return objetoOrdenado;
    }
  }
  return null;
}

function XgetCarpetas(xcliente)
{
  //https://drive.google.com/drive/folders/1IvnnIS-TpXJPV3B5SlFKzcaMWD1dqfE7
  var carpetaMain=DriveApp.getFolderById('1IvnnIS-TpXJPV3B5SlFKzcaMWD1dqfE7')
  var carpetas=carpetaMain.getFolders()
  var regex = /\b.(GMT)\b.*\)$/;
  var arrayFolders=[]
  var arrayFiles=[]
  while (carpetas.hasNext())
  {
    var carpeta=carpetas.next()
    var totArchivos=0
    var ultimo=''
    var lista=0
    const regex2 = /^0[1-5]/;  // validar que inicien por 01,02,03,04,05
    var archivos=carpeta.getFiles()
    arrayFiles=[]
    while (archivos.hasNext())
    {
      var archivo=archivos.next()
      if (archivo.getName().includes(xcliente) && regex2.test(archivo.getName()))
      {
        var objlista={
          Id:lista,
          Nombre:archivo.getName(),
          Tamano:Math.round(archivo.getSize()/1024/1024)
        }
        arrayFiles.push(objlista)
        lista ++
      }
      totArchivos ++
      if (archivo.getDateCreated() > ultimo)
      {
        ultimo=archivo.getDateCreated()
      }
    }
//    Logger.log(arrayFiles)
    var objCarpeta={
      Nombre:carpeta.getName(),
      Url:carpeta.getUrl(),
      Descripcion:!carpeta.getDescription()?'-':carpeta.getDescription(),
      Ultimo:carpeta.getLastUpdated().toString().replace(regex,''),
      TotArchivos:totArchivos,
      Ult_Archivo:ultimo.toString().replace(regex,''),
      Lista:arrayFiles
    }
    arrayFolders.push(objCarpeta)
//    Logger.log(carpeta.getName())
  }
  Logger.log(arrayFolders)
  return arrayFolders
}

function getDataProduccion(hoja)
{
  //https://docs.google.com/spreadsheets/d/1wgGbaYFEqnbEQxZj6KAyPS1qTuju8-Lw0W3cprGixoE/edit#gid=1218158384
  var sheet = SpreadsheetApp.openById('1wgGbaYFEqnbEQxZj6KAyPS1qTuju8-Lw0W3cprGixoE').getSheetByName(hoja);
//  var datos = sheet.getDataRange().getValues();
//  Logger.log(datos);
  var celdas = sheet.getDataRange();
  var colores = celdas.getBackgrounds();
//  Logger.log(colores);
  var objetoUnido = { Celda: celdas.getValues(), Color: colores };
  Logger.log(objetoUnido);
  return objetoUnido;
}

function getDataMP(hoja)
{
  //https://docs.google.com/spreadsheets/d/1uvPk2vheYZQP5jkYtOcDsaDQ1dHUROtn9JB-T186XtI/edit?usp=sharing
  var sheet = SpreadsheetApp.openById('1uvPk2vheYZQP5jkYtOcDsaDQ1dHUROtn9JB-T186XtI').getSheetByName(hoja);
//  var datos = sheet.getDataRange().getValues();
//  Logger.log(datos);
  var celdas = sheet.getDataRange();
  var colores = celdas.getBackgrounds();
//  Logger.log(colores);
  var objetoUnido1 = { Origen: hoja, Celda: celdas.getValues(), Color: colores };
//  Logger.log(objetoUnido1);
  return objetoUnido1;
}

function obtenerExtension(nombreArchivo) {
  var regex = /\.[^/.]+$/; // Expresión regular que busca la última aparición del carácter "." en el nombre del archivo
  var extension = nombreArchivo.match(regex);
  return extension[0];
}

function subirArchivoX(form) 
{
  logger.log(form)
}

function subirArchivo(form) 
{
  try{
    //https://drive.google.com/drive/folders/1H4zbij8JptnbKPgb0orLrxH3ohAfoqY_    Medellin
    //https://drive.google.com/drive/folders/1IvnnIS-TpXJPV3B5SlFKzcaMWD1dqfE7    Bogota
    //https://drive.google.com/drive/folders/1CeO1JlxbkaxpnX1ifwIlG5-83rPsOR_u    Vendedores
    var carpetaMain=DriveApp.getFolderById('1CeO1JlxbkaxpnX1ifwIlG5-83rPsOR_u')
    const xsucursal=form.xsucursal
    const xcliente=form.xcliente
    var folders = carpetaMain.getFolders();
    var carpeta
    while (folders.hasNext()) {
      var folder = folders.next();
      if (folder.getName().indexOf(xcliente) !== -1) {
        carpeta = folder.getId(); // Obtiene el ID de la carpeta existente
        break;
      }
    }

    if (!carpeta) { // Si no se encontró la carpeta, entonces la crea
      var xcarpeta = carpetaMain.createFolder(xcliente);
      carpeta = xcarpeta.getId();
    }

    var xcarpeta = DriveApp.getFolderById(carpeta)
    // Ahora puedes crear un archivo en la carpeta usando el ID obtenido
    var archivo = form.archivo;
    switch (obtenerExtension(archivo.getName().toUpperCase())) 
    {
      case '.PDF':
        var mime='application/pdf'
        break;
      case '.JPG': 
        var mime='image/jpeg'
        break;
      case '.TIF': 
        var mime='image/tiff'
        break;
      case '.PNG': 
        var mime='image/png'
        break;
      case '.DOCX': 
        var mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break;
      case '.XLSX': 
        var mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break;
      case '.DOC': 
      case '.XLS': 
        var mime='application/msword'
        break;
      default:
        Logger.log(obtenerExtension(archivo.getName().toUpperCase()))
        return 'Tipo de Archivo errado'
    }
    var fileBlob = archivo.getAs(mime); // Cambiar 'application/pdf' por el tipo MIME del archivo que quieres subir
    var file = xcarpeta.createFile(fileBlob).setName(xsucursal+'-'+xcliente+'-'+archivo.getName());
    var output=file.getName()
    return output;
  }catch(e){
    return 'Error: ' + e.toString();
  }
}

function uploadFileToDrive(base64Data, fileName, xcliente, xsucursal) 
{
  try{
    var splitBase = base64Data.split(','),
        type = splitBase[0].split(';')[0].replace('data:','');

    var byteCharacters = Utilities.base64Decode(splitBase[1]);
    var ss = Utilities.newBlob(byteCharacters, type);
    ss.setName(xsucursal + '-' + xcliente + '-' + fileName);

  //https://drive.google.com/drive/folders/1H4zbij8JptnbKPgb0orLrxH3ohAfoqY_    Medellin
  //https://drive.google.com/drive/folders/1IvnnIS-TpXJPV3B5SlFKzcaMWD1dqfE7    Bogota
  //https://drive.google.com/drive/folders/1CeO1JlxbkaxpnX1ifwIlG5-83rPsOR_u    Vendedores
  //https://drive.google.com/drive/folders/1Z2xxSVmgfJJPN9XkivTpEqlA9_nz5PuW    Facturas
//  var carpetaMain=DriveApp.getFolderById('1CeO1JlxbkaxpnX1ifwIlG5-83rPsOR_u')
//    var folder, folders = DriveApp.getFoldersByName(dropbox);
    var xfolder, folders = DriveApp.getFolderById('1CeO1JlxbkaxpnX1ifwIlG5-83rPsOR_u')

  var xfolders = folders.getFolders();
  var carpeta
  while (xfolders.hasNext()) {
    var xfolder = xfolders.next();
    if (xfolder.getName().indexOf(xcliente) !== -1) {
      carpeta = xfolder.getId(); // Obtiene el ID de la carpeta existente
      break;
    }
  }

  if (!carpeta) { // Si no se encontró la carpeta, entonces la crea
    var xcarpeta = folders.createFolder(xcliente)
    xcarpeta.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT);
    carpeta = xcarpeta.getId();
  }

    xcarpeta = DriveApp.getFolderById(carpeta)
    var file = xcarpeta.createFile(ss);

    return file.getName();
  }catch(e){
    return 'Error: ' + e.toString();
  }
}

function previsualizarDocumento(nombreDocumento) {
  // Obtener la carpeta compartida
  var carpetaCompartidaId = "1Z2xxSVmgfJJPN9XkivTpEqlA9_nz5PuW";
  var carpetaCompartida = DriveApp.getFolderById(carpetaCompartidaId);
  
  // Buscar el documento por nombre
  var archivos = carpetaCompartida.getFilesByName(nombreDocumento);
Logger.log(archivos)  
  if (archivos.hasNext()) {
    var documento = archivos.next();
    var urlPrevisualizacion = "https://docs.google.com/viewer?url=" + encodeURIComponent(documento.getUrl());
    return urlPrevisualizacion;
  } else {
    return "El documento no fue encontrado.";
  }
}


function buscarDocumentoDrive(nombreDocumento, carpetaId, anio) 
{
  //https://drive.google.com/drive/folders/10Or7idPHWIXnc9BSI52ZG8RYB-cEGkSe?usp=share_link    // facturas/AcerosIndustriales
  var folderId = "10Or7idPHWIXnc9BSI52ZG8RYB-cEGkSe";  // AcerosIndustriales
  if (!carpetaId) carpetaId = folderId;
  var stack = [];
  var i=0
  Logger.log(nombreDocumento)
  stack.push(DriveApp.getFolderById(carpetaId));
  while (stack.length > 0) 
  {
    i++
Logger.log(i)    
    var carpeta = stack.pop();
    var archivos = carpeta.getFilesByName(nombreDocumento);
    if (archivos.hasNext()) {
      var archivo = archivos.next();
      var fileId = archivo.getId();
      var fileUrl = DriveApp.getFileById(fileId).getUrl();
      Logger.log(fileUrl)
      return fileUrl;
    }
    var subcarpetas = carpeta.getFolders();
Logger.log('*** '+carpeta.getName())
    while (subcarpetas.hasNext()) {
      stack.push(subcarpetas.next());
    }
  }
  return null;
}

 
function crearCita(fec_i,fec_f,detalle,cliente,invitado) 
{
  var fechaHoy = new Date(fec_i);
  fechaHoy.setHours(08, 0, 0); // Establece la hora de inicio 
  var fechaFin = new Date(fec_f);
  fechaFin.setHours(17, 0, 0); // Establece la hora de finalización 
  
////  var evento = CalendarApp.getDefaultCalendar().createEvent('CRM-AisaCloud',fechaHoy,fechaFin,{ timeZone: Session.getScriptTimeZone(), description: detalle })
  var evento = CalendarApp.getDefaultCalendar().createEvent('CRM-AisaCloud',fechaFin,fechaFin,{ timeZone: Session.getScriptTimeZone(), description: cliente+' / '+detalle })
  // Set reminders for events 1 hour before their start time
  for (const event of evento) {
    const startTime = event.getStartTime();
    const reminderTime = new Date(startTime.getTime() - 3600000); // 1 hour before start time in milliseconds
    event.addReminder({
      method: "popup",
      minutes: 60, // 1 hour reminder
      reminderTime: reminderTime,
    });
  }
  //agrgar recordatorio
  evento.addEmailReminder(30);
  // Agrega un invitado al evento
  if (invitado !='') evento.addGuest(invitado);
}


function pruebas2()
{
//  var aa=buscarDocumentoDrive('A2-26176.pdf')
//  Logger.log(aa)
  getDataSql(`select cl.codvendedor,m.codigo,cl.nombre,min(femision) as emision,sum(saldo) as saldo,cl.terminopago, invcxc:f_wf_observacion(m.codigo) as observacion1,
     max(dias) AS dias, case when max(dias)<='30' then 'R000_30' else case when max(dias)<='60' then 'R031_60' else case when max(dias)<='90' then 'R061_90' else case when max(dias)<='120' then 'R091_120' else 'R121_999' end end end end as rango
     from invcxc:v_saldoscxc m 
     left join invcxc:clientes cl on cl.codigo=m.codigo 
     left join invcxc:vendedores v on v.codvendedor=cl.codvendedor 
     where cl.codvendedor='14' and m.codigo='M5072'
     group by  cl.codvendedor,m.codigo,cl.nombre,cl.terminopago
     having sum(saldo)<>0
     order by cl.codvendedor,emision`)
}


function openTemplateX(html_pag) {
  // Cache key based on the template filename
  const cacheKey = `template_${html_pag}`;

  // Check if cached HTML exists
  const cachedHtml = CacheService.getScriptCache().get(cacheKey);
  if (cachedHtml) {
////    return cachedHtml;
  }

  // Generate HTML if not cached
  var html = HtmlService.createHtmlOutputFromFile(html_pag).getContent();

  // Cache the generated HTML
  CacheService.getScriptCache().put(cacheKey, html, 3600); // Cache for 1 hour

  return html;
}

function openTemplate(html_pag) {
  try {
    const template = HtmlService.createTemplateFromFile(html_pag);
    const html = template.evaluate().getContent();
    return html;
  } catch (error) {
    console.error("Error getting template content:", error);
    // Handle the error here, e.g., return a default HTML content
    return "<p>Error loading template.</p>";
  }
}

