// generates region code & location object array from `turso db locations` output

const raw = `ams  Amsterdam, Netherlands
arn  Stockholm, Sweden
atl  Atlanta, Georgia (US)              
bog  Bogotá, Colombia                   
bos  Boston, Massachusetts (US)         
cdg  Paris, France                      
den  Denver, Colorado (US)              
dfw  Dallas, Texas (US)                 
ewr  Secaucus, NJ (US)                  
eze  Ezeiza, Argentina                  
fra  Frankfurt, Germany                 
gdl  Guadalajara, Mexico                
gig  Rio de Janeiro, Brazil             
gru  São Paulo, Brazil                  
hkg  Hong Kong, Hong Kong               
iad  Ashburn, Virginia (US)             
jnb  Johannesburg, South Africa         
lax  Los Angeles, California (US)       
lhr  London, United Kingdom             
maa  Chennai (Madras), India            
mad  Madrid, Spain                      
mia  Miami, Florida (US)                
nrt  Tokyo, Japan                       
ord  Chicago, Illinois (US)
otp  Bucharest, Romania                 
qro  Querétaro, Mexico                  
scl  Santiago, Chile                    
sea  Seattle, Washington (US)           
sin  Singapore, Singapore               
sjc  San Jose, California (US)          
syd  Sydney, Australia                  
waw  Warsaw, Poland                     
yul  Montreal, Canada                   
yyz  Toronto, Canadaams  Amsterdam, Netherlands             
arn  Stockholm, Sweden                  
atl  Atlanta, Georgia (US)              
bog  Bogotá, Colombia                   
bos  Boston, Massachusetts (US)         
cdg  Paris, France                      
den  Denver, Colorado (US)              
dfw  Dallas, Texas (US)                 
ewr  Secaucus, NJ (US)                  
eze  Ezeiza, Argentina                  
fra  Frankfurt, Germany                 
gdl  Guadalajara, Mexico                
gig  Rio de Janeiro, Brazil             
gru  São Paulo, Brazil                  
hkg  Hong Kong, Hong Kong               
iad  Ashburn, Virginia (US)             
jnb  Johannesburg, South Africa         
lax  Los Angeles, California (US)       
lhr  London, United Kingdom             
maa  Chennai (Madras), India            
mad  Madrid, Spain                      
mia  Miami, Florida (US)                
nrt  Tokyo, Japan                       
ord  Chicago, Illinois (US)
otp  Bucharest, Romania                 
qro  Querétaro, Mexico                  
scl  Santiago, Chile                    
sea  Seattle, Washington (US)           
sin  Singapore, Singapore               
sjc  San Jose, California (US)          
syd  Sydney, Australia                  
waw  Warsaw, Poland                     
yul  Montreal, Canada                   
yyz  Toronto, Canada`;

const regions = raw
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.split("  "))
    .map(([code, location]) => ({code, location}));

console.log(regions);