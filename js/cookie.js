$(document).ready(function() {
    
    $('#accept-cookies').on('click', function() {
      
      localStorage.setItem('cookieConsent', 'true');
     
      $('#cookie-banner').addClass('hidden');
    });

    if (localStorage.getItem('cookieConsent') === 'true') {
      $('#cookie-banner').addClass('hidden');
    }


    setInterval(() => {
        fetch('../../server_ini/auth.php', {  
          method: 'GET', 
          credentials: 'include' 
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'invalid') {
            
            console.log('Session érvénytelen, átirányítunk...');
            
          } else {
            console.log(data.message);
          }
        })
        .catch(error => console.error('Hálózati hiba:', error));
      }, 3600000 ); 

      fetch('../../server_ini/auth.php', {  
        method: 'GET', 
        credentials: 'include' 
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'invalid') {
          
          console.log('Session érvénytelen, átirányítunk...');
          
        } else {
          console.log(data.message);
        }
      })
      .catch(error => console.error('Hálózati hiba:', error));
   
  });