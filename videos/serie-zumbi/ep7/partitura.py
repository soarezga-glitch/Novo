# gera partitura-sons.json a partir dos tempos das falas (rodar de novo sempre que o áudio mudar) — Ep. 7 "A Perna do Tião"
# noite no curral: tensão grave + coração na mira; clique do farol; trilha de rock baixinha quando o Dimas vira o chefe; gemido no rastro
import json
P=json.loads(open('legenda-dados.js').read().split('window.PALAVRAS = ',1)[1].split(';\nwindow.SEGMENTOS')[0])
SEG={s['id']:s for s in json.load(open('segmentos.json'))}
def W(i,n): ws=[p for p in P if p['seg']==i]; return ws[min(n,len(ws)-1)]['start']
de=lambda i: SEG[i]['de']; ate=lambda i: SEG[i]['ate']
FIM=ate('N07')+0.6; CART=FIM+0.5; END=CART+3.6
T_FAROL=W('N02',9)-0.15; T_BAIXA=de('P04')+0.2
# inícios dos planos (iguais aos da cena)
besta=de('N01')-0.1; tres=W('N01',10)-0.1; farol=W('N02',6)-0.1; calca=de('N03')-0.1; corte=de('N04')-0.1; olhaV=de('N05')-0.1
portC=W('N05',8)-0.1; cerca=W('N05',12)-0.1; casa=W('N05',15)-0.1; juntos=W('N06',5)-0.1; dormem=de('N07')-0.1; rastro=W('N07',5)-0.1; chega=W('N07',12)-0.1
B='../../../.claude/skills/sons-de-ambiente/biblioteca/'
A=lambda s,a,b,db,fade=0.4: dict(som=s,de=round(a,2),ate=round(b,2),db=db,fade=fade)
E=lambda s,t,db: dict(som=s,em=round(t,2),db=db)
amb=[A('amb_tensao_grave',0,besta,-8,0.1),
 A('amb_sitio_noite',besta,dormem,-19),A('amb_tensao_grave',besta,T_BAIXA,-10,0.5),A('sfx_coracao',tres,de('N02'),-6,0.3),A('sfx_coracao',calca,corte+3.0,-9,0.4),
 A('sfx_moto_lenta',T_FAROL,olhaV,-24,0.6),
 A('amb_noite_fria',portC,de('P05')-0.2,-16,0.3),A('trilha_rock',de('P05')-0.2,dormem,-17,1.0),
 A('amb_sitio_noite',dormem,rastro,-17,0.4),A('amb_noite_fria',rastro,FIM,-14,0.4),A('amb_tensao_grave',rastro-0.4,FIM,-6,0.4),A('sfx_coracao',chega,FIM,-5,0.2),
 A('amb_tensao_grave',CART,END,-16)]
ef=[E('whoosh-cinematic',0.05,-6),E('sfx_impacto_cinema',0.12,-1),E('impact-bass-1',0.55,-3),E('sfx_moto_acelera',0.3,-12),E('whoosh-short',1.1,-10),E('pop',1.15,-12),E('impact-bass-2',besta,-6),
 E('sfx_clique_grave',W('N01',1),-4),E('sfx_estalo',W('N01',5),-12),E('sfx_relogio_contagem',W('N01',12),-8),
 E('sfx_taque',W('N01',12),-6),E('sfx_taque',de('P01')+0.5,-6),E('sfx_taque',de('P02')-0.3,-4),E('sfx_grito_menina',de('P02')-0.45,-14),E('impact-bass-2',de('P02'),-6),
 E('sfx_passo_capim_2',de('P02')-0.4,-8),E('sfx_passo_capim_3',de('P02')-0.15,-8),
 E('sfx_clique',T_FAROL-0.05,-2),E('sfx_clique_grave',T_FAROL,-6),E('impact-bass-1',T_FAROL+0.02,-8),E('sfx_estatica',T_FAROL,-22),
 E('sfx_pano',calca+0.3,-4),E('sfx_pano',calca+1.6,-6),E('sfx_pano',calca+2.8,-8),E('sfx_sopro_reverso',W('N03',6)-0.3,-10),
 E('whoosh-short',W('N04',0)-0.1,-10),E('pop',W('N04',0),-10),E('pop',W('N04',2),-10),E('chime',W('N04',3),-12),
 E('sfx_estalo',T_BAIXA,-10),E('sfx_clique',T_BAIXA+0.6,-10),E('sfx_capim_mexe',T_BAIXA+0.7,-12),
 E('whoosh-short',portC,-10),E('sfx_porteira_range',portC+0.1,-12),E('pop',W('N05',9),-12),E('whoosh-short',cerca,-10),E('pop',W('N05',13),-12),E('whoosh-short',casa,-10),E('sfx_porta_range',casa+0.15,-12),E('pop',W('N05',16),-12),
 E('impact-bass-2',W('P05',13),-8),E('pop',W('P05',13),-12),E('whoosh-cinematic',juntos,-12),E('impact-bass-1',W('N06',12),-8),
 E('sfx_martelada',de('P06')+0.2,-16),E('sfx_coruja',dormem+0.4,-12),E('sfx_cachorro_longe',dormem+1.6,-20),
 E('sfx_sopro_reverso',rastro-0.3,-6),E('sfx_gemido_perto',rastro+0.8,-10),E('sfx_farejar',W('N07',9),-8),E('sfx_gemido_perto',chega+0.6,-6),
 E('sfx_porteira_range',W('N07',14),-6),E('impact-bass-1',FIM-0.15,-2),E('sfx_impacto_cinema',FIM-0.1,-4),E('whoosh-cinematic',CART,-8),E('pop',CART+1.0,-12)]
passos=[dict(som='sfx_passo_capim',de=rastro+0.2,ate=W('N07',12),intervalo=0.62,db=-10),dict(som='sfx_passo_capim',de=chega,ate=W('N07',14)+0.2,intervalo=0.55,db=-8)]
json.dump(dict(duracao=round(END,2),voz='fala_master.wav',biblioteca=[B+x for x in ['apocalipse','hoje','ui']],ambientes=amb,efeitos=ef,passos=passos,ducking=dict(db=6),volume_final_lufs=-10),open('partitura-sons.json','w'),indent=1,ensure_ascii=False)
print('fim',round(END,1))
