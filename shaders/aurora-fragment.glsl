// Optimized Aurora Shader for Better Performance
// Based on nimitz 2017 aurora - simplified for VR/real-time use

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
varying vec2 vUv;
varying vec3 vWorldPosition;

#define time iTime

mat2 mm2(in float a){float c = cos(a), s = sin(a);return mat2(c,s,-s,c);}
float tri(in float x){return clamp(abs(fract(x)-.5),0.01,0.49);}
vec2 tri2(in vec2 p){return vec2(tri(p.x)+tri(p.y),tri(p.y+tri(p.x)));}

// Simplified noise function - reduced iterations for performance
float triNoise2d(in vec2 p, float spd)
{
    float z=1.8;
    float z2=2.5;
	float rz = 0.;
    p *= mm2(p.x*0.06);
    vec2 bp = p;
	for (float i=0.; i<3.; i++ ) // Reduced from 5 to 3 iterations
	{
        vec2 dg = tri2(bp*1.85)*.75;
        dg *= mm2(time*spd*0.01);
        p -= dg/z2;

        bp *= 1.3;
        z2 *= .45;
        z *= .42;
		p *= 1.21 + (rz-1.0)*.02;
        
        rz += tri(p.x+tri(p.y))*z;
        p*= mm2(0.95534);
	}
    return clamp(1./pow(rz*29., 1.3),0.,.55);
}

float hash21(in vec2 n){ return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

// Optimized aurora function - reduced iterations
vec4 aurora(vec3 ro, vec3 rd)
{
    vec4 col = vec4(0);
    vec4 avgCol = vec4(0);
    
    for(float i=0.;i<25.;i++) // Reduced from 50 to 25 iterations
    {
        float of = 0.006*hash21(rd.xz * 50.0)*smoothstep(0.,15., i); // Reduced hash input
        float pt = ((2.5+pow(i,1.4)*.002)-ro.y)/(rd.y*2.+0.4);
        pt -= of;
    	vec3 bpos = ro + pt*rd;
        vec2 p = bpos.zx;
        float rzt = triNoise2d(p * 0.15, 0.008); // Slightly increased scale for less detail
        vec4 col2 = vec4(0,0,0, rzt);
        col2.rgb = (sin(1.-vec3(2.15,-.5, 1.2)+i*0.043)*0.5+0.5)*rzt;
        avgCol =  mix(avgCol, col2, .5);
        col += avgCol*exp2(-i*0.1 - 2.5)*smoothstep(0.,5., i); // Slightly faster falloff
        
    }
    
    col *= (clamp(rd.y*25.+.4,0.,1.));
    
    return col*1.5; // Slightly reduced brightness
}

// Simplified star function - fewer iterations
vec3 stars(in vec3 p)
{
    vec3 c = vec3(0.);
    float res = 512.0; // Reduced resolution
    
	for (float i=0.;i<2.;i++) // Reduced from 4 to 2 iterations
    {
        vec3 q = fract(p*(.15*res))-0.5;
        vec3 id = floor(p*(.15*res));
        vec2 rn = vec2(hash21(id.xy), hash21(id.yz)); // Simplified hash
        float c2 = 1.-smoothstep(0.,.6,length(q));
        c2 *= step(rn.x,.001+i*i*0.002);
        c += c2*(mix(vec3(1.0,0.49,0.1),vec3(0.75,0.9,1.),rn.y)*0.15+0.85);
        p *= 1.3;
    }
    return c*c*.6; // Reduced intensity
}

// Simple gradient background - no mountains
vec3 bg(in vec3 rd)
{
    float gradient = smoothstep(-0.2, 0.8, rd.y);
    vec3 nightSky = mix(vec3(0.02,0.05,0.15), vec3(0.05,0.1,0.25), gradient);
    return nightSky * 0.8;
}

void main()
{
    // Use world position to create seamless 3D effect
    vec3 worldPos = normalize(vWorldPosition);
    vec3 rd = worldPos;
    
    // Move camera origin higher for better aurora perspective
    vec3 ro = vec3(0,-2.0,-6.7);
    
    vec3 col = vec3(0.);
    float fade = smoothstep(0.,0.01,abs(rd.y))*0.1+0.9;
    
    // Simple background
    col = bg(rd)*fade;
    
    // Only render aurora in upper hemisphere for performance
    if (rd.y > -0.1){
        vec4 aur = smoothstep(0.,1.2,aurora(ro,rd))*fade; // Slightly reduced smoothstep
        col += stars(rd) * 0.8; // Reduced star intensity
        col = col*(1.-aur.a) + aur.rgb;
    }
    
	gl_FragColor = vec4(col, 1.);
} 